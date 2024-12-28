import { PetsRepository } from '@/repositories/pets-repository'
import { Pet } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface DeletePetUseCaseRequest {
  id: string
}

interface DeletePetUseCaseResponse {
  pet: Pet
}

export class DeletePetUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute({
    id,
  }: DeletePetUseCaseRequest): Promise<DeletePetUseCaseResponse> {
    const pet = await this.petsRepository.findById(id)

    if (!pet) {
      throw new ResourceNotFoundError()
    }

    await this.petsRepository.delete(id)

    return { pet }
  }
}
