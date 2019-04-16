declare module '@google-cloud/vision' {
  export class ImageAnnotatorClient {
    labelDetection(bucketFileURL: string): [{ labelAnnotations: { description: string }[] }]
  }
}
