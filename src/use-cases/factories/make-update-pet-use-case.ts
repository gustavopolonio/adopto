import { S3FileStorageProvider } from '@/providers/file-storage/implementations/s3-file-storage-provider'
import { PrismaOrgsRepository } from '@/repositories/prisma/prisma-orgs-repository'
import { PrismaPetsRepository } from '@/repositories/prisma/prisma-pets-repository'
import { PrismaPhotosRepository } from '@/repositories/prisma/prisma-photos-repository'
import { UpdatePetUseCase } from '../update-pet'

export function makeUpdatePetUseCase() {
  const petsRepository = new PrismaPetsRepository()
  const orgsRepository = new PrismaOrgsRepository()
  const photosRepository = new PrismaPhotosRepository()
  const fileStorageProvider = new S3FileStorageProvider()
  return new UpdatePetUseCase(
    petsRepository,
    orgsRepository,
    photosRepository,
    fileStorageProvider,
  )
}
