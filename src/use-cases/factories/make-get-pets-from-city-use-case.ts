import { PrismaPetsRepository } from '@/repositories/prisma/prisma-pets-repository'
import { GetPetsFromCityUseCase } from '../get-pets-from-city'

export function makeGetPetsFromCityUseCase() {
  const petsRepository = new PrismaPetsRepository()
  return new GetPetsFromCityUseCase(petsRepository)
}
