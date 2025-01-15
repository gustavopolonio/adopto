import { Org, Prisma } from '@prisma/client'
import { OrgsRepository } from '../orgs-repository'
import { prisma } from '@/lib/prisma'

export class PrismaOrgsRepository implements OrgsRepository {
  async findById(id: string) {
    const org = await prisma.org.findUnique({
      where: {
        id,
        deleted_at: null,
      },
    })

    return org
  }

  async findByEmail(email: string) {
    const org = await prisma.org.findUnique({
      where: {
        email,
        deleted_at: null,
      },
    })

    return org
  }

  async create(data: Prisma.OrgCreateInput) {
    const org = await prisma.org.create({
      data,
    })

    return org
  }

  async save(data: Org) {
    const org = await prisma.org.update({
      where: {
        id: data.id,
      },
      data,
    })

    return org
  }

  async softDelete(id: string) {
    await prisma.org.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    })
  }
}
