import { Prisma, Pet } from '@prisma/client'
import { PetsRepository } from '../pets-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryPetsRepository implements PetsRepository {
  public pets: Pet[] = []

  async create(
    data: Prisma.PetUncheckedCreateInput & {
      photos?: string[]
      adoption_requirements?: string[]
    },
  ): Promise<Pet> {
    const pet = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      age_in_months: data.age_in_months,
      size: data.size,
      energy_level: data.energy_level,
      photos: data.photos ?? [],
      adoption_requirements: data.adoption_requirements ?? [],
      org_id: data.org_id,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.pets.push(pet)

    return pet
  }
}
