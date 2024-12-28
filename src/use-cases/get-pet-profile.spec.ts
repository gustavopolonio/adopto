import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { GetPetProfileUseCase } from './get-pet-profile'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'

let orgsRepository: InMemoryOrgsRepository
let petsRepository: InMemoryPetsRepository
let sut: GetPetProfileUseCase

describe('Get pet profile use case', () => {
  beforeEach(() => {
    orgsRepository = new InMemoryOrgsRepository()
    petsRepository = new InMemoryPetsRepository()
    sut = new GetPetProfileUseCase(petsRepository)
  })

  it('should be able to get a pet profile', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const createdPet = await petsRepository.create({
      org_id: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    const { pet } = await sut.execute({
      id: createdPet.id,
    })

    expect(pet.id).toEqual(expect.any(String))
    expect(pet).toEqual(
      expect.objectContaining({
        org_id: pet.org_id,
        name: 'Pet 1',
        description: 'Description 1',
      }),
    )
  })
})
