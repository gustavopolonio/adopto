import { beforeEach, describe, expect, it } from 'vitest'
import { compare } from 'bcryptjs'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { RegisterOrgUseCase } from './register-org'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

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

  it('should be able to register an org with unknown address', async () => {
    const { org } = await sut.execute({
      name: 'Org 1',
      email: 'org1@test.test',
      password: '123456',
      zipCode: 'xxxxx-xxx',
      address: 'Unknown address, xx',
      city: 'Unknown city',
      whatsapp: '16 99399-0990',
    })

    expect(org.id).toEqual(expect.any(String))
    expect(org.latitude).toBeNull()
    expect(org.longitude).toBeNull()
  })

  it('should be able to hash org password upon org creation', async () => {
    const password = '123456'

    const { org } = await sut.execute({
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

  it('should not be able to register an org with an existing email', async () => {
    await sut.execute({
      name: 'Org 1',
      email: 'org1@test.test',
      password: '123456',
      zipCode: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    await expect(
      sut.execute({
        name: 'Org 1',
        email: 'org1@test.test',
        password: '123456',
        zipCode: '13566-583',
        address: 'Rua Tomaz Antonio Gonzaga, 382',
        city: 'São Carlos',
        whatsapp: '16 99399-0990',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
