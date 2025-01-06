import { Readable } from 'node:stream'

export interface FileStorageProvider {
  upload(
    petId: string,
    file: Readable,
    filename: string,
    mimetype: string,
  ): Promise<{ fileUrl: string | null }>
}
