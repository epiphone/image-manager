import sqip from 'sqip'

export default function makeSqip(inputPath: string, numberOfPrimitives = 5) {
  return sqip({
    filename: inputPath,
    numberOfPrimitives,
  })
}
