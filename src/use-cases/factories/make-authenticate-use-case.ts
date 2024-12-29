import { PrismaOrgsRepository } from '@/repositories/prisma/prisma-orgs-repository'
import { AuthenticateUseCase } from '../authenticate'

export function makeAuthenticateUseCase() {
  const orgsRepository = new PrismaOrgsRepository()
  return new AuthenticateUseCase(orgsRepository)
}
