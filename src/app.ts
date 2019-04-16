import { Storage } from '@google-cloud/storage'
import express from 'express'
import multer from 'multer'
import path from 'path'

const gcs = new Storage()
const BUCKET_IMAGES = gcs.bucket('imgmgr-server-images')
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-server-thumbnails')

const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg', '.gif']
const MAX_BYTES = 1024 * 1024 * 10

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '/tmp')
  },
  filename(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
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
  BUCKET_IMAGES.upload(
    req.file.path,
    {
      destination: req.file.filename,
      metadata: {
        metadata: { Labels: 'todo' },
      },
    },
    (error, result) => {
      if (error) {
        return next(error)
      }
      console.log('Uploaded to Cloud Storage', result!.metadata)
      res.json({ status: 'ok', metadata: result!.metadata })
    },
  )
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
