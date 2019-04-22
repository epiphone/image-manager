import fs from 'fs'
import lqip from 'lqip'
import { promisify } from 'util'

export default async function makeLqip(inputPath: string, outputPath: string) {
  const dataURL = await lqip.base64(inputPath)
  return promisify(fs.writeFile)(
    outputPath,
    dataURL.replace(/^data:image\/(jpeg|jpg|png);base64,/, ''),
    'base64',
  )
}
