import { FileStorageProvider } from '../file-storage-provider'

export class MockFileSorageProvider implements FileStorageProvider {
  public shouldUploadFail = false
  public shouldRemoveFail = false
  private storage: { fileUrl: string; fileKey: string }[] = []

  async upload(
    _petId: string,
    _file: Buffer,
    filename: string,
    _mimetype: string,
  ) {
    let fileUrl = null
    let fileKey = null

    if (!this.shouldUploadFail) {
      fileUrl = `http://mock-storage/${filename}`
      fileKey = filename
      this.storage.push({ fileUrl, fileKey })
    }

    return { fileUrl, fileKey }
  }

  async remove(key: string) {
    if (this.shouldRemoveFail) {
      throw new Error()
    }

    const fileIndex = this.storage.findIndex((file) => file.fileKey === key)

    if (fileIndex >= 0) {
      this.storage.splice(fileIndex, 1)
    }
  }
}
