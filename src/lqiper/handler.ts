import { Storage } from '@google-cloud/storage'
import os from 'os'
import path from 'path'
import lqip from '../lqip'
import { CloudStorageObject, Context } from '../model'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')
const TMP_DIR = os.tmpdir()

export async function lqiper(data: CloudStorageObject, context: Context) {
  const fileName = `${new Date().toISOString()}-${data.name}`
  const tmpFilePath = path.join(TMP_DIR, fileName)
  await gcs
    .bucket(data.bucket)
    .file(data.name)
    .download({ destination: tmpFilePath })

  const lqipName = `lqip-${fileName}`
  const lqipPath = path.join(TMP_DIR, lqipName)
  return lqip(tmpFilePath, lqipPath).then(() => {
    return BUCKET_THUMBNAILS.upload(lqipPath, {
      destination: lqipName,
    })
  })
}
