import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'
import { EnergyLevel, Pet, Size } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface RegisterPetUseCaseRequest {
  name: string
  description: string
  ageInMonths: number
  size: Size
  energyLevel: EnergyLevel
  photos: string[]
  adoptionRequirements: string[]
  orgId: string
}

interface RegisterPetUseCaseResponse {
  pet: Pet
}

export class RegisterPetUseCase {
  constructor(
    private petsRepository: PetsRepository,
    private orgsRepository: OrgsRepository,
  ) {}

  async execute({
    name,
    description,
    ageInMonths,
    size,
    energyLevel,
    photos,
    adoptionRequirements,
    orgId,
  }: RegisterPetUseCaseRequest): Promise<RegisterPetUseCaseResponse> {
    const org = await this.orgsRepository.findById(orgId)

    if (!org) {
      throw new ResourceNotFoundError()
    }

    const pet = await this.petsRepository.create({
      name,
      description,
      age_in_months: ageInMonths,
      size,
      energy_level: energyLevel,
      photos,
      adoption_requirements: adoptionRequirements,
      org_id: orgId,
    })

    return { pet }
  }
}
