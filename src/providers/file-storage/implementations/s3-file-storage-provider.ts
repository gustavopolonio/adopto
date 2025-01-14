import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client } from '@/lib/aws-s3'
import { env } from '@/env'
import { FileStorageProvider } from '../file-storage-provider'

export class S3FileStorageProvider implements FileStorageProvider {
  async upload(
    petId: string,
    file: Buffer,
    filename: string,
    mimetype: string,
  ) {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: env.BUCKET_NAME,
        Key: `${petId}-${Date.now()}-${filename}`,
        Body: file,
        ContentType: mimetype,
      },
    })

    const uploadedFile = await upload.done()

    let fileUrl = null
    let fileKey = null

    if (uploadedFile.Location) {
      fileUrl = uploadedFile.Location
    }

    if (uploadedFile.Key) {
      fileKey = uploadedFile.Key
    }

    return { fileUrl, fileKey }
  }

  async remove(key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: key,
    })
    await s3Client.send(deleteCommand)
  }
}
