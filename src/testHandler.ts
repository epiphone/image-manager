import { Request, Response } from 'express'
// import { Storage } from '@google-cloud/storage'

export default function http(request: Request, response: Response) {
  // const storage = new Storage()
  response.status(200).send('Hello World!')
}
