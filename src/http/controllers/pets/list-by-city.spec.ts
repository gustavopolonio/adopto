import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { registerOrg } from '@/http/tests/utils/register-org'
import { registerPet } from '@/http/tests/utils/register-pet'
import { authenticateAsOrg } from '@/http/tests/utils/authenticate-as-org'

describe('List pets by city (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it.skip('should be able to list pets by city', async () => {
    await registerOrg({
      name: 'Org 1',
      email: 'org1@test.test',
      password: '123456',
      zipCode: '13566-583',
      address: 'Thomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
    })
    const { token: tokenOrg1 } = await authenticateAsOrg({
      email: 'org1@test.test',
      password: '123456',
    })

    await registerPet(tokenOrg1, {
      name: 'Pet 1',
      description: 'Description 1',
    })

    await registerPet(tokenOrg1, {
      name: 'Pet 2',
      description: 'Description 2',
    })

    await registerOrg({
      name: 'Org 2',
      email: 'org2@test.test',
      password: '123456',
      zipCode: '17201-390',
      address: 'Rua Olavo Bilac',
      city: 'Jaú',
    })
    const { token: tokenOrg2 } = await authenticateAsOrg({
      email: 'org2@test.test',
      password: '123456',
    })

    await registerPet(tokenOrg2, {
      name: 'Pet 3',
      description: 'Description 3',
    })

    const response = await request(app.server).get('/pets').query({
      city: 'Jau',
    })

    expect(response.status).toEqual(200)
    expect(response.body.pets).toHaveLength(1)
    expect(response.body).toEqual({
      pets: [
        expect.objectContaining({
          name: 'Pet 3',
          description: 'Description 3',
        }),
      ],
    })
  })
})
