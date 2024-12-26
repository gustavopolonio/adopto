import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { AuthenticateUseCase } from './authenticate'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let orgsRepository: InMemoryOrgsRepository
let sut: AuthenticateUseCase

describe('Authenticate org use case', () => {
  beforeEach(() => {
    orgsRepository = new InMemoryOrgsRepository()
    sut = new AuthenticateUseCase(orgsRepository)
  })

  it('should be able to authenticate as an org', async () => {
    const email = 'org1@test.test'
    const password = '123456'

    await orgsRepository.create({
      name: 'Org 1',
      email,
      password_hash: await hash(password, 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const { org } = await sut.execute({
      email,
      password,
    })

    expect(org.id).toEqual(expect.any(String))
  })

  it('should not be able to authenticate with wrong email', async () => {
    await expect(
      sut.execute({
        email: 'org1@test.test',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
