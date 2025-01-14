import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'
import { registerOrg } from '@/http/tests/utils/register-org'
import { registerPet } from '@/http/tests/utils/register-pet'
import { authenticateAsOrg } from '@/http/tests/utils/authenticate-as-org'

describe('Remove pet (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to remove a pet', async () => {
    await registerOrg()
    const { token } = await authenticateAsOrg()
    await registerPet(token)

    const pet = await prisma.pet.findFirst()

    if (!pet) {
      throw new Error()
    }

    const response = await request(app.server)
      .delete(`/pets/${pet.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toEqual(204)
  })
})
