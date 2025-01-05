import { Readable } from 'stream'
import { FileStorageProvider } from '../file-storage-provider'

export class MockFileSorageProvider implements FileStorageProvider {
  public shouldFail = false

  async upload(_file: Readable, filename: string, _mimetype: string) {
    let fileUrl = null

    if (!this.shouldFail) {
      fileUrl = `http://mock-storage/${filename}`
    }

    return { fileUrl }
  }
}
