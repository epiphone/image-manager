import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { CloudStorageObject, Context } from '../model'
import sqip from '../sqip'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')
const NUMBER_OF_PRIMITIVES = 9
const TMP_DIR = os.tmpdir()

export async function sqiper(data: CloudStorageObject, context: Context) {
  const fileName = `${new Date().toISOString()}-${data.name}`
  const tmpFilePath = path.join(TMP_DIR, fileName)
  await gcs
    .bucket(data.bucket)
    .file(data.name)
    .download({ destination: tmpFilePath })

  const { final_svg } = sqip(tmpFilePath, NUMBER_OF_PRIMITIVES)
  const sqipName = `sqip${NUMBER_OF_PRIMITIVES}-${path.parse(fileName).name}.svg`
  const sqipPath = path.join(TMP_DIR, sqipName)
  fs.writeFile(sqipPath, final_svg, error => {
    if (error) {
      console.error('Writing SQIP file failed:', error)
    }
    return BUCKET_THUMBNAILS.upload(sqipPath, {
      destination: sqipName,
    })
  })
}
