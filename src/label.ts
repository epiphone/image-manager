import { ImageAnnotatorClient } from '@google-cloud/vision'

const client = new ImageAnnotatorClient()

export async function getBucketFileLabels(file: { bucket: string; name: string }) {
  const [{ labelAnnotations }] = await client.labelDetection(`gs://${file.bucket}/${file.name}`)

  return labelAnnotations.map(d => d.description).join(', ')
}
