import { Org, Prisma } from '@prisma/client'
import { OrgsRepository } from '../orgs-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryOrgsRepository implements OrgsRepository {
  public orgs: Org[] = []

  async findById(id: string) {
    const org = this.orgs.find((org) => org.id === id)

    if (!org) return null
    return org
  }

  async findByEmail(email: string) {
    const org = this.orgs.find((org) => org.email === email)

    if (!org) return null
    return org
  }

  async create(data: Prisma.OrgCreateInput) {
    const org = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      zip_code: data.zip_code,
      address: data.address,
      city: data.city,
      whatsapp: data.whatsapp,
      latitude: data.latitude
        ? new Prisma.Decimal(Number(data.latitude))
        : null,
      longitude: data.longitude
        ? new Prisma.Decimal(Number(data.longitude))
        : null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    }

    this.orgs.push(org)

    return org
  }

  async save(org: Org) {
    const orgIndex = this.orgs.findIndex((orgItem) => orgItem.id === org.id)

    if (orgIndex >= 0) {
      this.orgs[orgIndex] = org
    }

    return org
  }

  async delete(id: string) {
    const orgIndex = this.orgs.findIndex((orgItem) => orgItem.id === id)

    if (orgIndex >= 0) {
      this.orgs[orgIndex].deleted_at = new Date()
    }
  }
}
