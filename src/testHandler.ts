import { Request, Response } from 'express'

export function testHandler(request: Request, response: Response) {
  response.status(200).send('Hello World!')
}
