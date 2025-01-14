import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { registerOrg } from '@/http/tests/utils/register-org'
import { registerPet } from '@/http/tests/utils/register-pet'
import { authenticateAsOrg } from '@/http/tests/utils/authenticate-as-org'

describe('Get pet profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get a pet profile', async () => {
    const petName = 'Pet 1'
    const petDescription = 'Description 1'

    await registerOrg()
    const { token } = await authenticateAsOrg()
    await registerPet(token, {
      name: petName,
      description: petDescription,
    })

    const pet = await prisma.pet.findFirst()

    if (!pet) {
      throw new Error()
    }

    const response = await request(app.server).get(`/pets/${pet.id}`)

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
      pet: expect.objectContaining({
        name: petName,
        description: petDescription,
      }),
    })
  })
})
