import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { CloudStorageObject, Context } from '../model'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')

async function resizer(data: CloudStorageObject, context: Context) {
  const tempDir = path.join(os.tmpdir(), 'thumbs')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
  }
  const tmpFilePath = path.join(tempDir, 'source.png')

  await gcs
    .bucket(data.bucket)
    .file(data.name)
    .download({ destination: tmpFilePath })

  const sizes = [32, 64]
  const uploadPromises = sizes.map(async size => {
    const thumbName = `thumb@${size}_${data.name}`
    const thumbPath = path.join(tempDir, thumbName)

    await sharp(tmpFilePath)
      .resize(size, size)
      .toFile(thumbPath)

    return BUCKET_THUMBNAILS.upload(thumbPath, {
      destination: thumbName,
    })
  })

  return Promise.all(uploadPromises)
}

module.exports = { resizer }
