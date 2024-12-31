import { PrismaOrgsRepository } from '@/repositories/prisma/prisma-orgs-repository'
import { PrismaPetsRepository } from '@/repositories/prisma/prisma-pets-repository'
import { DeleteOrgUseCase } from '../delete-org'

export function makeDeleteOrgUseCase() {
  const orgsRepository = new PrismaOrgsRepository()
  const petsRepository = new PrismaPetsRepository()
  return new DeleteOrgUseCase(orgsRepository, petsRepository)
}
