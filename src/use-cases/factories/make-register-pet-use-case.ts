import { PrismaOrgsRepository } from '@/repositories/prisma/prisma-orgs-repository'
import { PrismaPetsRepository } from '@/repositories/prisma/prisma-pets-repository'
import { PrismaPhotosRepository } from '@/repositories/prisma/prisma-photos-repository'
import { S3FileStorageProvider } from '@/providers/file-storage/implementations/s3-file-storage-provider'
import { RegisterPetUseCase } from '../register-pet'

export function makeRegisterPetUseCase() {
  const petsRepository = new PrismaPetsRepository()
  const orgsRepository = new PrismaOrgsRepository()
  const photosRepository = new PrismaPhotosRepository()
  const fileStorageProvider = new S3FileStorageProvider()
  return new RegisterPetUseCase(
    petsRepository,
    orgsRepository,
    photosRepository,
    fileStorageProvider,
  )
}
