import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { GetPetsFromCityUseCase } from './get-pets-from-city'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'

let orgsRepository: InMemoryOrgsRepository
let petsRepository: InMemoryPetsRepository
let sut: GetPetsFromCityUseCase

describe('Get pets from city use case', () => {
  beforeEach(() => {
    orgsRepository = new InMemoryOrgsRepository()
    petsRepository = new InMemoryPetsRepository(orgsRepository)
    sut = new GetPetsFromCityUseCase(petsRepository)
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
    const ageInMonths = 12

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
      age_in_months: ageInMonths,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: ageInMonths,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 3',
      description: 'Description 3',
      age_in_months: 14,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    const { pets } = await sut.execute({
      city,
      page: 1,
      ageInMonths,
    })

    expect(pets).toHaveLength(2)
    expect(pets).toEqual([
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 1',
        description: 'Description 1',
      }),
      expect.objectContaining({
        org_id: org.id,
        name: 'Pet 2',
        description: 'Description 2',
      }),
    ])
  })
})
