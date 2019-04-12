import sqip from 'sqip'

export default function makeSqip(inputPath: string, numberOfPrimitives = 10) {
  return sqip({
    filename: inputPath,
    numberOfPrimitives,
  })
}
