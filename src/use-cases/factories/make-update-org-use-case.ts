import { PrismaOrgsRepository } from '@/repositories/prisma/prisma-orgs-repository'
import { UpdateOrgUseCase } from '../update-org'

export function makeUpdateOrgUseCase() {
  const orgsRepository = new PrismaOrgsRepository()
  return new UpdateOrgUseCase(orgsRepository)
}
