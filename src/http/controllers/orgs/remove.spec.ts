import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { registerOrg } from '@/http/tests/utils/register-org'
import { authenticateAsOrg } from '@/http/tests/utils/authenticate-as-org'

describe('Remove org (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to remove an org', async () => {
    await registerOrg()
    const { token } = await authenticateAsOrg()

    const response = await request(app.server)
      .delete('/orgs')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.status).toEqual(204)
    // to-do: Check if org and pets are deleted_at (soft delete)
  })
})
