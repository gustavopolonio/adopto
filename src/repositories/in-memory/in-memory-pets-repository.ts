import { Prisma, Pet } from '@prisma/client'
import { PetsRepository } from '../pets-repository'
import { randomUUID } from 'node:crypto'
import { InMemoryOrgsRepository } from './in-memory-orgs-repository'
import { paginate } from '@/utils/paginate'

export class InMemoryPetsRepository implements PetsRepository {
  public pets: Pet[] = []

  constructor(private inMemoryOrgsRepository?: InMemoryOrgsRepository) {}

  async findById(id: string) {
    const pet = this.pets.find((pet) => pet.id === id)

    if (!pet) return null
    return pet
  }

  async findManyByCity(city: string, page: number) {
    if (!this.inMemoryOrgsRepository) {
      throw new Error('inMemoryOrgsRepository is required for this operation')
    }

    const orgsFromDesiredCity = this.inMemoryOrgsRepository.orgs.filter(
      (org) =>
        org.city
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase() ===
        city
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase(),
    )

    const pets = this.pets.filter((pet) => {
      return (
        orgsFromDesiredCity.find((org) => org.id === pet.org_id) &&
        !pet.deleted_at
      )
    })

    const petsPaginated = paginate(pets, page)

    return petsPaginated
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
