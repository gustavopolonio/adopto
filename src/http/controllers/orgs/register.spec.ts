import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'

describe('Register org (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register as an org', async () => {
    const response = await request(app.server).post('/orgs').send({
      name: 'Org 2',
      email: 'org1@test.test',
      password: '123456',
      zipCode: '13566-583',
      address: 'Rua Thomaz Antonio Gonzaga, Pq Arnold Schimidt',
      city: 'São Carlos',
      whatsapp: '16 99090-9090',
    })

    expect(response.status).toEqual(201)
  })
})
