import { Storage } from '@google-cloud/storage'
import { CloudStorageObject, Context } from '../model'
const vision = require('@google-cloud/vision')

const gcs = new Storage()
const client = new vision.ImageAnnotatorClient()

export async function labeler(data: CloudStorageObject, context: Context) {
  const [result] = await client.labelDetection(`gs://${data.bucket}/${data.name}`)
  const labels = result.labelAnnotations as Array<{ description: string }>

  return gcs
    .bucket(data.bucket)
    .file(data.name)
    .setMetadata(
      { metadata: { Labels: labels.map(d => d.description).join(', ') } },
      {},
      (error, res) => {
        if (error) {
          console.error(error)
        }
      },
    )
}
