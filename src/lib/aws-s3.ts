import { S3Client } from '@aws-sdk/client-s3'
import { env } from '@/env'

export const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})
