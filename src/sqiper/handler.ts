import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import { CloudStorageObject, Context } from '../model'
import sqip from '../sqip'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')
const TMP_DIR = os.tmpdir()

export async function sqiper(data: CloudStorageObject, context: Context) {
  const fileName = `${new Date().toISOString()}-${data.name}`
  const tmpFilePath = path.join(TMP_DIR, fileName)
  await gcs
    .bucket(data.bucket)
    .file(data.name)
    .download({ destination: tmpFilePath })

  const { final_svg } = sqip(tmpFilePath)
  const sqipName = `sqip-${path.parse(fileName).name}.svg`
  const sqipPath = path.join(TMP_DIR, sqipName)
  await promisify(fs.writeFile)(sqipPath, final_svg)
  return BUCKET_THUMBNAILS.upload(sqipPath, {
    destination: sqipName,
  })
}
