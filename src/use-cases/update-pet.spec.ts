import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { UpdatePetUseCase } from './update-pet'

let orgsRepository: InMemoryOrgsRepository
let petsRepository: InMemoryPetsRepository
let sut: UpdatePetUseCase

describe('Update pet use case', () => {
  beforeEach(() => {
    orgsRepository = new InMemoryOrgsRepository()
    petsRepository = new InMemoryPetsRepository()
    sut = new UpdatePetUseCase(petsRepository, orgsRepository)
  })

  it('should be able to update a pet', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: '123456',
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const petCreated = await petsRepository.create({
      name: 'Pet 1',
      description: 'Pet 1 description',
      age_in_months: 10,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      photos: ['photo1.jpg'],
      adoption_requirements: ['Requirement 1'],
      org_id: org.id,
    })

    const { pet } = await sut.execute({
      id: petCreated.id,
      name: 'Pet 1 updated',
      description: 'Pet 1 description updated',
      ageInMonths: 12,
      size: 'SMALL',
      energyLevel: 'LOW',
      photos: ['photo1.jpg', 'photo2.jpg'],
      adoptionRequirements: ['Requirement 2'],
      orgId: petCreated.org_id,
    })

    expect(pet).toEqual(
      expect.objectContaining({
        id: petCreated.id,
        org_id: org.id,
        name: 'Pet 1 updated',
      }),
    )
  })
})
