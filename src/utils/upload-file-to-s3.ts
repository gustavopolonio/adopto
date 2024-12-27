import path from 'path'
import * as fs from 'fs'
import { MultipartFile } from '@fastify/multipart'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client } from '@/lib/aws-s3'

export async function uploadFileToS3(file: MultipartFile) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: 'adopto-pet-images',
      Key: `${Date.now()}-${path.basename(file.filename)}`,
      Body: fs.createReadStream(file.filename),
      ContentType: file.mimetype,
    },
  })

  return await upload.done()
}
