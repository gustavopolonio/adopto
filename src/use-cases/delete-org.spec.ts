import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { DeleteOrgUseCase } from './delete-org'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { randomUUID } from 'node:crypto'

let petsRepository: InMemoryPetsRepository
let orgsRepository: InMemoryOrgsRepository
let sut: DeleteOrgUseCase

describe('Delete org use case', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    orgsRepository = new InMemoryOrgsRepository()
    sut = new DeleteOrgUseCase(orgsRepository, petsRepository)
  })

  it('should be able to delete an org', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.create({
      org_id: org.id,
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: 8,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await petsRepository.create({
      org_id: randomUUID(),
      name: 'Pet 2',
      description: 'Description 2',
      age_in_months: 8,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await sut.execute({
      id: org.id,
    })

    expect(orgsRepository.orgs[0].deleted_at).not.toBeNull()
    expect(petsRepository.pets).toHaveLength(3)
    expect(petsRepository.pets[0].deleted_at).not.toBeNull()
    expect(petsRepository.pets[1].deleted_at).not.toBeNull()
    expect(petsRepository.pets[2].deleted_at).toBeNull()
  })

  it('should not be able to delete an unexisting org', async () => {
    await expect(
      sut.execute({
        id: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
