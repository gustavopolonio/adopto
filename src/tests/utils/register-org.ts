import request from 'supertest'
import { app } from '@/app'
import { RegisterOrgInput } from '@/@types/orgs'

export async function registerOrg(customData: Partial<RegisterOrgInput> = {}) {
  const defaultData = {
    name: 'Org Test 1',
    email: 'org-test-1@test.test',
    password: '123456',
    zipCode: '13566-583',
    address: 'Thomaz Antonio Gonzaga, 382',
    city: 'São Carlos',
    whatsapp: '19 99999-9999',
  }

  const orgData = { ...defaultData, ...customData }

  const response = await request(app.server).post('/orgs').send(orgData)

  if (response.status !== 201) {
    throw new Error(`Failed to register org: ${response.text}`)
  }

  return orgData
}
