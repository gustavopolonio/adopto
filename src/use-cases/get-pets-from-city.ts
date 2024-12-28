import { EnergyLevel, Pet, Size } from '@prisma/client'
import { PetsRepository } from '@/repositories/pets-repository'

interface GetPetsFromCityUseCaseRequest {
  city: string
  page: number
  sortBy?: 'mostRecent'
  ageInMonths?: number
  size?: Size
  energyLevel?: EnergyLevel
}

interface GetPetsFromCityUseCaseResponse {
  pets: Pet[]
}

export class GetPetsFromCityUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute({
    city,
    page,
    sortBy,
    ageInMonths,
    size,
    energyLevel,
  }: GetPetsFromCityUseCaseRequest): Promise<GetPetsFromCityUseCaseResponse> {
    const pets = await this.petsRepository.findManyByCity(city, page, sortBy, {
      ageInMonths,
      size,
      energyLevel,
    })

    return { pets }
  }
}
