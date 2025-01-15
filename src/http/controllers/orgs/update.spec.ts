import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { registerOrg } from '@/http/tests/utils/register-org'
import { authenticateAsOrg } from '@/http/tests/utils/authenticate-as-org'

describe('Update org (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a org', async () => {
    await registerOrg()
    const { token } = await authenticateAsOrg()

    const response = await request(app.server)
      .put('/orgs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Org 1 - updated',
        email: 'org1-updated@test.test',
        password: '123456',
        zipCode: '13566-583',
        address: 'Rua Thomaz Antonio Gonzaga, Pq Arnold Schimidt',
        city: 'São Carlos',
        whatsapp: '16 99090-9090',
      })

    expect(response.status).toEqual(204)
  })
})
