import { PetsRepository } from '@/repositories/pets-repository'
import { Pet } from '@prisma/client'

interface GetPetsFromCityUseCaseRequest {
  city: string
  page: number
}

interface GetPetsFromCityUseCaseResponse {
  pets: Pet[]
}

export class GetPetsFromCityUseCase {
  constructor(private petsRepository: PetsRepository) {}

  async execute({
    city,
    page,
  }: GetPetsFromCityUseCaseRequest): Promise<GetPetsFromCityUseCaseResponse> {
    const pets = await this.petsRepository.findManyByCity(city, page)

    return { pets }
  }
}
