import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { execSync } from 'child_process'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '@/lib/aws-s3'
import { Photo } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { Environment } from 'vitest/environments'

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Provid a valid DATABASE_URL env variable')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)

  return url.toString()
}

export default <Environment>{
  name: 'prisma-environment',
  transformMode: 'ssr',
  setup() {
    const schema = randomUUID()
    const databaseUrl = generateDatabaseUrl(schema)
    process.env.DATABASE_URL = databaseUrl

    execSync('npx prisma migrate deploy')

    return {
      async teardown() {
        const photos = await prisma.$queryRawUnsafe<Photo[] | []>(
          `SELECT * FROM "${schema}"."photos"`,
        )

        // Deleting files from S3 test bucket after running each test
        await Promise.all(
          photos.map(async (photo) => {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: process.env.BUCKET_NAME,
              Key: photo.key,
            })
            await s3Client.send(deleteCommand)
          }),
        )

        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )
        await prisma.$disconnect()
      },
    }
  },
}
