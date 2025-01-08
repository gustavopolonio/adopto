import { Readable } from 'node:stream'

export function createDummyFile(fileData = 'dummy data') {
  const fileStream = new Readable()
  fileStream.push(fileData)
  fileStream.push(null)
  return fileStream
}
