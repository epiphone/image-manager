import sharp from 'sharp'

export default async function resize(inputPath: string, outputPath: string, w = 32, h = 32) {
  return sharp(inputPath)
    .resize(w, h)
    .toFile(outputPath)
}
