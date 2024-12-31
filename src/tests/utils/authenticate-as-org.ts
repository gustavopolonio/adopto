import request from 'supertest'
import { app } from '@/app'
import { AuthenticateOrgInput } from '@/@types/orgs'

export async function authenticateAsOrg(
  customData: Partial<AuthenticateOrgInput> = {},
): Promise<{ token: string }> {
  const defaultData = {
    email: 'org-test-1@test.test',
    password: '123456',
  }

  const authenticateData = { ...defaultData, ...customData }

  const response = await request(app.server)
    .post('/sessions')
    .send(authenticateData)

  if (response.status !== 200) {
    throw new Error(`Failed to authenticate as org: ${response.text}`)
  }

  return response.body
}
