import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { RegisterPetUseCase } from './register-pet'

let orgsRepository: InMemoryOrgsRepository
let sut: RegisterPetUseCase

describe('Register pet use case', () => {
  beforeEach(() => {
    const petRepository = new InMemoryPetsRepository()
    orgsRepository = new InMemoryOrgsRepository()
    sut = new RegisterPetUseCase(petRepository, orgsRepository)
  })

  it('should be able to register a pet', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const { pet } = await sut.execute({
      orgId: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      ageInMonths: 12,
      size: 'MEDIUM',
      energyLevel: 'HIGH',
      photos: ['photo1.jpg'],
      adoptionRequirements: ['Requirement 1'],
    })

    expect(pet.id).toEqual(expect.any(String))
  })
})
