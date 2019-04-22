require('@google-cloud/trace-agent').start()
import { Storage } from '@google-cloud/storage'
import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { promisify } from 'util'
import { getBucketFileLabels } from './label'
import resize from './resize'
import sqip from './sqip'

const gcs = new Storage()
const BUCKET_IMAGES = gcs.bucket('imgmgr-server-images')
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-server-thumbnails')
const RESIZE_SIZE = 32

const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg', '.gif']
const MAX_BYTES = 1024 * 1024 * 10

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '/tmp')
  },
  filename(req, file, cb) {
    cb(null, file.fieldname + '-' + new Date().toISOString() + path.extname(file.originalname))
  },
})

const uploads = multer({
  storage,
  limits: { files: 10, fileSize: MAX_BYTES },
  fileFilter(req, file, callback) {
    if (!ALLOWED_EXTS.includes(path.extname(file.originalname))) {
      return callback(new Error('Only images are allowed'), false)
    }
    callback(null, true)
  },
})

const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', uploads.single('image'), (req, res, next) => {
  console.log('Received file upload', req.file.filename)

  const labelPromise = BUCKET_IMAGES.upload(req.file.path, {
    destination: req.file.filename,
  })
    .then(([result]) => {
      console.log('Uploaded original image to Cloud Storage')
      return Promise.all([
        result,
        getBucketFileLabels({ bucket: result!.bucket.name, name: result!.name }),
      ])
    })
    .then(([result, labels]) => {
      console.log('Got labels', labels)
      return result.setMetadata({ metadata: { Labels: labels } }, {})
    })

  const thumbName = `thumb${RESIZE_SIZE}-${req.file.filename}`
  const thumbPath = path.join(path.dirname(req.file.path), thumbName)
  const resizePromise = resize(req.file.path, thumbPath, RESIZE_SIZE, RESIZE_SIZE).then(() => {
    console.log('Resized image')
    return BUCKET_THUMBNAILS.upload(thumbPath, {
      destination: thumbName,
    })
  })

  const sqipName = `sqip-${path.parse(req.file.filename).name}.svg`
  const sqipPath = path.join(path.dirname(req.file.path), sqipName)
  const sqipPromise = new Promise(resolve => {
    const { final_svg } = sqip(req.file.path)
    console.log('Generated SQIP')
    resolve(final_svg)
  })
    .then(finalSvg => promisify(fs.writeFile)(sqipPath, finalSvg))
    .then(() => {
      console.log('Wrote local SQIP file')
      return BUCKET_THUMBNAILS.upload(sqipPath, {
        destination: sqipName,
      })
    })

  Promise.all([labelPromise, resizePromise, sqipPromise])
    .then(([[metadata]]) => {
      res.json({ status: 'ok', metadata })
      const tempFilePaths = [req.file.path, thumbPath, sqipPath]
      tempFilePaths.forEach(tempFilePath => {
        fs.unlink(tempFilePath, rmError => {
          if (rmError) {
            console.error(rmError)
          }
          console.log('Deleted local file', tempFilePath)
        })
      })
    })
    .catch(error => next(error))
})

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(error)
  }
  console.error(error)
  res.status(500)
  res.json({ message: error.message, name: error.name, status: 'error' })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
