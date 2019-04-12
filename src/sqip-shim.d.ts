declare module 'sqip' {
  interface Options {
    filename: string
    numberOfPrimitives?: number
    mode?: number
    blur?: number
  }

  interface Result {
    final_svg: string
  }

  function sqip(options: Options): Result

  export default sqip
}
