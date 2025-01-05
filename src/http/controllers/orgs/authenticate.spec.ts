import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { registerOrg } from '@/http/tests/utils/register-org'

describe('Authenticate org (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to authenticate as an org', async () => {
    const org = await registerOrg()

    const response = await request(app.server).post('/sessions').send({
      email: org.email,
      password: org.password,
    })

    expect(response.status).toEqual(200)
    expect(response.body.token).toEqual(expect.any(String))
  })
})
