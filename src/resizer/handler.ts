import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { CloudStorageObject, Context } from '../model'
import resize from '../resize'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')
const SIZE = 32

export async function resizer(data: CloudStorageObject, context: Context) {
  const tempDir = path.join(os.tmpdir(), 'thumbs')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
  }
  const tmpFilePath = path.join(tempDir, data.name)

  await gcs
    .bucket(data.bucket)
    .file(data.name)
    .download({ destination: tmpFilePath })

  const thumbName = `thumb@${SIZE}_${data.name}`
  const thumbPath = path.join(tempDir, thumbName)

  await resize(tmpFilePath, thumbPath, SIZE, SIZE)

  return BUCKET_THUMBNAILS.upload(thumbPath, {
    destination: thumbName,
  })
}
