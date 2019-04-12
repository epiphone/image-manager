import { Storage } from '@google-cloud/storage'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { CloudStorageObject, Context } from '../model'
import sqip from '../sqip'

const gcs = new Storage()
const BUCKET_THUMBNAILS = gcs.bucket('imgmgr-thumbnails')
const NUMBER_OF_PRIMITIVES = 6

export async function sqiper(data: CloudStorageObject, context: Context) {
  const tempDir = path.join(os.tmpdir(), 'sqips')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
  }
  const tmpFilePath = path.join(tempDir, 'source.png')

  await gcs
    .bucket(data.bucket)
    .file(data.name)
    .download({ destination: tmpFilePath })

  const { final_svg } = sqip(tmpFilePath, NUMBER_OF_PRIMITIVES)
  const sqipName = `sqip@${NUMBER_OF_PRIMITIVES}_${data.name.split('.')[0]}.svg`
  const sqipPath = path.join(tempDir, sqipName)
  fs.writeFile(sqipPath, final_svg, error => {
    if (error) {
      console.error('Writing SQIP file failed:', error)
    }
    return BUCKET_THUMBNAILS.upload(sqipPath, {
      destination: sqipName,
    })
  })
}
