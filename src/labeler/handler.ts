import { Storage } from '@google-cloud/storage'
import { getBucketFileLabels } from '../label'
import { CloudStorageObject, Context } from '../model'

const gcs = new Storage()

export async function labeler(data: CloudStorageObject, context: Context) {
  const labels = await getBucketFileLabels(data)

  return gcs
    .bucket(data.bucket)
    .file(data.name)
    .setMetadata({ metadata: { Labels: labels } }, {}, error => {
      if (error) {
        console.error(error)
      }
    })
}
