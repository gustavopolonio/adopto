import { EnergyLevel, Pet, Size } from '@prisma/client'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdatePetUseCaseRequest {
  id: string
  name: string
  description: string
  ageInMonths: number
  size: Size
  energyLevel: EnergyLevel
  photos: string[]
  adoptionRequirements: string[]
  orgId: string
}

interface UpdatePetUseCaseResponse {
  pet: Pet
}

export class UpdatePetUseCase {
  constructor(
    private petsRepository: PetsRepository,
    private orgsRepository: OrgsRepository,
  ) {}

  async execute({
    id,
    name,
    description,
    ageInMonths,
    size,
    energyLevel,
    photos,
    adoptionRequirements,
    orgId,
  }: UpdatePetUseCaseRequest): Promise<UpdatePetUseCaseResponse> {
    const pet = await this.petsRepository.findById(id)

    if (!pet) {
      throw new ResourceNotFoundError()
    }

    const org = await this.orgsRepository.findById(orgId)

    if (!org) {
      throw new ResourceNotFoundError()
    }

    const petUpdated = await this.petsRepository.save({
      ...pet,
      name,
      description,
      age_in_months: ageInMonths,
      size,
      energy_level: energyLevel,
      photos,
      adoption_requirements: adoptionRequirements,
      org_id: orgId,
      updated_at: new Date(),
    })

    return { pet: petUpdated }
  }
}
