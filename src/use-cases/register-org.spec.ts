import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { RegisterOrgUseCase } from './register-org'

let sut: RegisterOrgUseCase

describe('Register org use case', () => {
  beforeEach(() => {
    const orgsRepository = new InMemoryOrgsRepository()
    sut = new RegisterOrgUseCase(orgsRepository)
  })

  it('should be able to register an org with valid address', async () => {
    const { org } = await sut.execute({
      name: 'Org 1',
      email: 'org1@test.test',
      password: '123456',
      zipCode: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    expect(org.id).toEqual(expect.any(String))
    expect(org.latitude).not.toBeNull()
    expect(org.longitude).not.toBeNull()
  })
})
