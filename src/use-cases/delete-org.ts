import { Org } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'

interface DeleteOrgUseCaseRequest {
  id: string
}

interface DeleteOrgUseCaseResponse {
  org: Org
}

export class DeleteOrgUseCase {
  constructor(
    private orgsRepository: OrgsRepository,
    private petsRepository: PetsRepository,
  ) {}

  async execute({
    id,
  }: DeleteOrgUseCaseRequest): Promise<DeleteOrgUseCaseResponse> {
    const org = await this.orgsRepository.findById(id)

    if (!org) {
      throw new ResourceNotFoundError()
    }

    await this.orgsRepository.softDelete(id)
    await this.petsRepository.softDeleteManyByOrgId(id)

    return { org }
  }
}
