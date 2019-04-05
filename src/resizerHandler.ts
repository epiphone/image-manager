import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { CloudStorageObject, Context } from './model'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')

export default async (data: CloudStorageObject, context: Context) => {
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

    // Resize source image
    await sharp(tmpFilePath)
      .resize(size, size)
      .toFile(thumbPath)

    // Upload to GCS
    return BUCKET_THUMBNAILS.upload(thumbPath, {
      destination: thumbName,
    })
  })

  // 4. Run the upload operations
  return Promise.all(uploadPromises)
}
