import { Readable } from 'node:stream'
import { FileStorageProvider } from '../file-storage-provider'

export class MockFileSorageProvider implements FileStorageProvider {
  public shouldUploadFail = false
  public shouldRemoveFail = false
  private storage: string[] = []

  async upload(
    _petId: string,
    _file: Readable,
    filename: string,
    _mimetype: string,
  ) {
    let fileUrl = null

    if (!this.shouldUploadFail) {
      fileUrl = `http://mock-storage/${filename}`
      this.storage.push(fileUrl)
    }

    return { fileUrl }
  }

  async remove(key: string) {
    if (this.shouldRemoveFail) {
      throw new Error()
    }

    const fileIndex = this.storage.findIndex((fileKey) => fileKey === key)

    if (fileIndex >= 0) {
      this.storage.splice(fileIndex, 1)
    }
  }
}
