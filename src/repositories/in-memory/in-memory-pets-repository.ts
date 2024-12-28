import { Prisma, Pet } from '@prisma/client'
import { PetsRepository } from '../pets-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryPetsRepository implements PetsRepository {
  public pets: Pet[] = []

  async findById(id: string) {
    const pet = this.pets.find((pet) => pet.id === id)

    if (!pet) return null
    return pet
  }

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
      deleted_at: null,
    }

    this.pets.push(pet)

    return pet
  }

  async save(pet: Pet) {
    const petIndex = this.pets.findIndex((petItem) => petItem.id === pet.id)

    if (petIndex >= 0) {
      this.pets[petIndex] = pet
    }

    return pet
  }

  async delete(id: string) {
    const petIndex = this.pets.findIndex((petItem) => petItem.id === id)

    if (petIndex >= 0) {
      this.pets[petIndex].deleted_at = new Date()
    }
  }

  async deleteManyByOrgId(orgId: string) {
    this.pets.forEach((pet, index) => {
      if (pet.org_id === orgId) {
        this.pets[index].deleted_at = new Date()
      }
    })
  }
}
