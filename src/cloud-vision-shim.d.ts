declare module '@google-cloud/vision' {
  export class ImageAnnotatorClient {
    labelDetection(
      bucketFileURL: string,
    ): Promise<[{ labelAnnotations: { description: string }[] }]>
  }
}
