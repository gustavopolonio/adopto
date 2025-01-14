import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { registerOrg } from '@/http/tests/utils/register-org'
import { registerPet } from '@/http/tests/utils/register-pet'
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
    await registerPet(token)

    const photo2 = path.join(__dirname, '..', '..', 'tests', 'dog.jpg')
    const pet = await prisma.pet.findFirst()

    if (!pet) {
      throw new Error()
    }

    const response = await request(app.server)
      .put(`/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Pet 1')
      .field('description', 'Description 1')
      .field('ageInMonths', 12)
      .field('size', 'MEDIUM')
      .field('energyLevel', 'HIGH')
      .field('adoptionRequirements', JSON.stringify(['Requirement 1']))
      .attach('photos', photo2)

    expect(response.status).toEqual(204)
  })
})
