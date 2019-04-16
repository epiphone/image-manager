import { ImageAnnotatorClient } from '@google-cloud/vision'
import { CloudStorageObject } from './model'

const client = new ImageAnnotatorClient()

export async function getBucketFileLabels(file: CloudStorageObject) {
  const [{ labelAnnotations }] = await client.labelDetection(`gs://${file.bucket}/${file.name}`)

  return labelAnnotations.map(d => d.description).join(', ')
}
