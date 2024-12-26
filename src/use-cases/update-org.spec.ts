import { beforeEach, describe, expect, it } from 'vitest'
import { compare } from 'bcryptjs'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { UpdateOrgUseCase } from './update-org'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let orgsRepository: InMemoryOrgsRepository
let sut: UpdateOrgUseCase

describe('Update org use case', () => {
  beforeEach(() => {
    orgsRepository = new InMemoryOrgsRepository()
    sut = new UpdateOrgUseCase(orgsRepository)
  })

  it('should be able to update an org with valid address', async () => {
    const createdOrg = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: '123456',
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const { org } = await sut.execute({
      id: createdOrg.id,
      name: 'Org 2',
      email: 'org2@test.test',
      password: '123456',
      zipCode: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    expect(org).toEqual(
      expect.objectContaining({
        id: createdOrg.id,
        name: 'Org 2',
        email: 'org2@test.test',
      }),
    )
    expect(orgsRepository.orgs).toHaveLength(1)
  })

  it('should be able to update an org with unknown address', async () => {
    const createdOrg = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: '123456',
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const { org } = await sut.execute({
      id: createdOrg.id,
      name: 'Org 2',
      email: 'org2@test.test',
      password: '123456',
      zipCode: 'xxxxx-xxx',
      address: 'Unknown address, xx',
      city: 'Unknown city',
      whatsapp: '16 99399-0990',
    })

    expect(org).toEqual(
      expect.objectContaining({
        id: createdOrg.id,
        name: 'Org 2',
        email: 'org2@test.test',
        latitude: null,
        longitude: null,
      }),
    )
    expect(orgsRepository.orgs).toHaveLength(1)
  })

  it('should not be able to update an unexisting org', async () => {
    await expect(
      sut.execute({
        id: 'unexisting-id',
        name: 'Org 2',
        email: 'org2@test.test',
        password: '123456',
        zipCode: '13566-583',
        address: 'Rua Tomaz Antonio Gonzaga, 382',
        city: 'São Carlos',
        whatsapp: '16 99399-0990',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be able to hash org password upon org update', async () => {
    const password = '000000'

    const createdOrg = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: '123456',
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const { org } = await sut.execute({
      id: createdOrg.id,
      name: 'Org 1',
      email: 'org1@test.test',
      password,
      zipCode: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const isPasswordCorrectlyHashed = await compare(password, org.password_hash)

    expect(isPasswordCorrectlyHashed).toBe(true)
  })
})
