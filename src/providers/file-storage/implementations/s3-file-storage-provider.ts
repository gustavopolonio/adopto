import { Readable } from 'node:stream'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '@/lib/aws-s3'
import { env } from '@/env'
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

  async remove(key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: key,
    })
    await s3Client.send(deleteCommand)
  }
}
