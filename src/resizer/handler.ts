import { Storage } from '@google-cloud/storage'
import os from 'os'
import path from 'path'
import { CloudStorageObject, Context } from '../model'
import resize from '../resize'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')
const SIZE = 32
const TEMP_DIR = os.tmpdir()

export async function resizer(data: CloudStorageObject, context: Context) {
  const fileName = `${new Date().toISOString()}-${data.name}`
  const tmpFilePath = path.join(TEMP_DIR, fileName)
  await gcs
    .bucket(data.bucket)
    .file(data.name)
    .download({ destination: tmpFilePath })

  const thumbName = `thumb${SIZE}-${fileName}`
  const thumbPath = path.join(TEMP_DIR, thumbName)

  await resize(tmpFilePath, thumbPath, SIZE, SIZE)

  return BUCKET_THUMBNAILS.upload(thumbPath, {
    destination: thumbName,
  })
}
