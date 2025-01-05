import { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client } from '@/lib/aws-s3'
import { env } from '@/env'

export async function uploadFileToS3(
  file: Readable,
  fileName: string,
  fileType: string,
) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: env.BUCKET_NAME,
      Key: `${Date.now()}-${fileName}`,
      Body: file,
      ContentType: fileType,
    },
  })

  return await upload.done()
}
