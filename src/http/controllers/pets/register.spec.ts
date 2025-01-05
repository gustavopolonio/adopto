import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { registerOrg } from '@/http/tests/utils/register-org'
import { authenticateAsOrg } from '@/http/tests/utils/authenticate-as-org'

describe('Register pet (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register a pet', async () => {
    await registerOrg()
    const { token } = await authenticateAsOrg()

    const photo1 = path.join(__dirname, '..', '..', 'tests', 'cat.jpg')
    const photo2 = path.join(__dirname, '..', '..', 'tests', 'dog.jpg')

    const response = await request(app.server)
      .post('/pets')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Pet 1')
      .field('description', 'Description 1')
      .field('ageInMonths', 12)
      .field('size', 'MEDIUM')
      .field('energyLevel', 'HIGH')
      .field('adoptionRequirements', JSON.stringify(['Requirement 1']))
      .attach('photos', photo1)
      .attach('photos', photo2)

    expect(response.status).toEqual(201)
  })
})
