import { Prisma, Pet, Size, EnergyLevel } from '@prisma/client'
import dayjs from 'dayjs'
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

  async findManyByCity(
    city: string,
    page: number,
    sortBy?: 'mostRecent',
    filters?: {
      ageInMonths?: {
        min: number
        max: number
      }
      size?: Size
      energyLevel?: EnergyLevel
    },
  ) {
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
        !pet.deleted_at && // Check if pet is deleted
        orgsFromDesiredCity.find((org) => org.id === pet.org_id) && // Check if pet city matches with received city
        (filters?.ageInMonths === undefined ||
          (filters?.ageInMonths.min <= pet.age_in_months &&
            filters?.ageInMonths.max >= pet.age_in_months)) && // Check age in months filter
        (filters?.energyLevel === undefined ||
          filters?.energyLevel === pet.energy_level) && // Check energy level filter
        (filters?.size === undefined || filters?.size === pet.size) // Check size filter
      )
    })

    if (sortBy === 'mostRecent') {
      pets.sort(
        (a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf(),
      )
    }

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
