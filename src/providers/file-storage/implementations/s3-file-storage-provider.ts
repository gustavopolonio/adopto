import { Readable } from 'node:stream'
import { FileStorageProvider } from '../file-storage-provider'
import { uploadFileToS3 } from '@/utils/upload-file-to-s3'

export class S3FileStorageProvider implements FileStorageProvider {
  async upload(
    petId: string,
    file: Readable,
    filename: string,
    mimetype: string,
  ) {
    const uploadedFile = await uploadFileToS3(petId, file, filename, mimetype)

    let fileUrl = null

    if (uploadedFile.Location) {
      fileUrl = uploadedFile.Location
    }

    return { fileUrl }
  }
}
