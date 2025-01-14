import { PetsRepository } from '@/repositories/pets-repository'
import { Pet } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized.error'

interface DeletePetUseCaseRequest {
  id: string
  orgId: string
}

interface DeletePetUseCaseResponse {
  pet: Pet
}

export class DeletePetUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute({
    id,
    orgId,
  }: DeletePetUseCaseRequest): Promise<DeletePetUseCaseResponse> {
    const pet = await this.petsRepository.findById(id)

    if (!pet) {
      throw new ResourceNotFoundError()
    }

    if (pet.org_id !== orgId) {
      throw new UnauthorizedError()
    }

    await this.petsRepository.delete(id)

    return { pet }
  }
}
