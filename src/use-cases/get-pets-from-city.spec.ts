import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { GetPetsFromCityUseCase } from './get-pets-from-city'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'

let orgsRepository: InMemoryOrgsRepository
let petsRepository: InMemoryPetsRepository
let sut: GetPetsFromCityUseCase

describe('Get pets from city use case', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    orgsRepository = new InMemoryOrgsRepository()
    petsRepository = new InMemoryPetsRepository(orgsRepository)
    sut = new GetPetsFromCityUseCase(petsRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get pets from existing city', async () => {
    const city = 'São Carlos'

    const firstOrg = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city,
      whatsapp: '16 99399-0990',
    })

    await petsRepository.create({
      org_id: firstOrg.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.create({
      org_id: firstOrg.id,
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    const petToDelete = await petsRepository.create({
      org_id: firstOrg.id,
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.delete(petToDelete.id)

    const secondOrg = await orgsRepository.create({
      name: 'Org 2',
      email: 'org2@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'Fortaleza',
      whatsapp: '16 99399-0990',
    })

    await petsRepository.create({
      org_id: secondOrg.id,
      name: 'Pet 3',
      description: 'Description 3',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    const { pets } = await sut.execute({
      city,
      page: 1,
    })

    expect(pets).toHaveLength(2)
    expect(pets).toEqual([
      expect.objectContaining({
        org_id: firstOrg.id,
        name: 'Pet 1',
        description: 'Description 1',
      }),
      expect.objectContaining({
        org_id: firstOrg.id,
        name: 'Pet 2',
        description: 'Description 2',
      }),
    ])
  })

  it('should be able to get paginated pets from existing city', async () => {
    const city = 'São Carlos'

    const firstOrg = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city,
      whatsapp: '16 99399-0990',
    })

    for (let i = 1; i <= 22; i++) {
      await petsRepository.create({
        org_id: firstOrg.id,
        name: `Pet ${i}`,
        description: `Description ${i}`,
        age_in_months: 12,
        size: 'MEDIUM',
        energy_level: 'HIGH',
        adoption_requirements: ['Requirement 1'],
      })
    }

    const { pets } = await sut.execute({
      city,
      page: 2,
    })

    expect(pets).toHaveLength(2)
    expect(pets).toEqual([
      expect.objectContaining({
        org_id: firstOrg.id,
        name: 'Pet 21',
        description: 'Description 21',
      }),
      expect.objectContaining({
        org_id: firstOrg.id,
        name: 'Pet 22',
        description: 'Description 22',
      }),
    ])
  })

  it('should not be able to get pets from unexisting city', async () => {
    const { pets } = await sut.execute({
      city: 'New York',
      page: 1,
    })

    expect(pets).toHaveLength(0)
    expect(pets).toEqual([])
  })

  it('should be able to get pets from existing city filtered by age in months', async () => {
    const city = 'São Carlos'

    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city,
      whatsapp: '16 99399-0990',
    })

    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 6,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 3',
      description: 'Description 3',
      age_in_months: 18,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    const { pets } = await sut.execute({
      city,
      page: 1,
      ageInMonths: {
        min: 12,
        max: 18,
      },
    })

    expect(pets).toHaveLength(2)
    expect(pets).toEqual([
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 2',
        description: 'Description 2',
      }),
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 3',
        description: 'Description 3',
      }),
    ])
  })

  it('should be able to get pets from existing city filtered by energy level and size', async () => {
    const city = 'São Carlos'
    const energyLevel = 'LOW'
    const size = 'LARGE'

    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city,
      whatsapp: '16 99399-0990',
    })

    // Pet won't be selected
    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: energyLevel,
      adoption_requirements: ['Requirement 1'],
    })

    // Pet won't be selected
    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: 12,
      size,
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    // Pet will be selected
    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 3',
      description: 'Description 3',
      age_in_months: 14,
      size,
      energy_level: energyLevel,
      adoption_requirements: ['Requirement 1'],
    })

    const { pets } = await sut.execute({
      city,
      page: 1,
      size,
      energyLevel,
    })

    expect(pets).toHaveLength(1)
    expect(pets).toEqual([
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 3',
        description: 'Description 3',
      }),
    ])
  })

  it('should be able to get pets from existing city ordered by most recent added', async () => {
    const city = 'São Carlos'

    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city,
      whatsapp: '16 99399-0990',
    })

    vi.setSystemTime(new Date(2000, 0, 1, 10, 0, 0, 0))

    // First created pet
    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'LOW',
      adoption_requirements: ['Requirement 1'],
    })

    vi.setSystemTime(new Date(2000, 0, 1, 10, 0, 0, 1))

    // Second created pet
    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: 12,
      size: 'LARGE',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    vi.setSystemTime(new Date(2000, 0, 2, 10, 0, 0, 0))

    // Third created pet
    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 3',
      description: 'Description 3',
      age_in_months: 14,
      size: 'LARGE',
      energy_level: 'LOW',
      adoption_requirements: ['Requirement 1'],
    })

    const { pets } = await sut.execute({
      city,
      page: 1,
      sortBy: 'mostRecent',
    })

    expect(pets).toHaveLength(3)
    expect(pets).toEqual([
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 3',
        description: 'Description 3',
      }),
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 2',
        description: 'Description 2',
      }),
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 1',
        description: 'Description 1',
      }),
    ])
  })
})
