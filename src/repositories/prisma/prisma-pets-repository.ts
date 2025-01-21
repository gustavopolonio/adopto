import { EnergyLevel, Pet, Prisma, Size } from '@prisma/client'
import { PetsRepository } from '../pets-repository'
import { prisma } from '@/lib/prisma'

export class PrismaPetsRepository implements PetsRepository {
  async findById(
    id: string,
    includePhotos = false,
    includeCoordinates = false,
  ) {
    const pet = await prisma.pet.findUnique({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        ...(includePhotos && {
          photos: {
            select: {
              url: true,
            },
          },
        }),
        ...(includeCoordinates && {
          org: {
            select: {
              latitude: true,
              longitude: true,
            },
          },
        }),
      },
    })

    return pet
  }

  async findManyByCity(
    city: string,
    page: number,
    sortBy?: 'mostRecent',
    filters?: {
      ageInMonths?: { min: number; max: number }
      size?: Size
      energyLevel?: EnergyLevel
    },
  ) {
    const petIdsFromCitiesThatMatch = await prisma.$queryRaw<{ id: string }[]>(
      Prisma.sql`
        SELECT p.id 
        FROM "pets" p
        JOIN "orgs" o ON p.org_id = o.id
        WHERE p."deleted_at" IS NULL
        AND "public".unaccent(o."city") ILIKE "public".unaccent(${city})
      `,
    )

    const petIds = petIdsFromCitiesThatMatch.map((pet) => pet.id)

    if (petIds.length === 0) return []

    const pets = await prisma.pet.findMany({
      where: {
        id: {
          in: petIds,
        },
        ...(filters?.ageInMonths && {
          age_in_months: {
            gte: filters.ageInMonths.min,
            lte: filters.ageInMonths.max,
          },
        }),
        ...(filters?.size && {
          size: filters.size,
        }),
        ...(filters?.energyLevel && {
          energy_level: filters.energyLevel,
        }),
      },
      ...(sortBy === 'mostRecent' && {
        orderBy: {
          created_at: 'desc',
        },
      }),
      include: {
        photos: {
          select: {
            url: true,
          },
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return pets
  }

  async create(data: Prisma.PetUncheckedCreateInput) {
    const pet = await prisma.pet.create({
      data,
    })

    return pet
  }

  async save(data: Pet) {
    const pet = await prisma.pet.update({
      where: {
        id: data.id,
      },
      data,
    })

    return pet
  }

  async softDelete(id: string) {
    await prisma.pet.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    })
  }

  async softDeleteManyByOrgId(orgId: string) {
    await prisma.pet.updateMany({
      where: {
        org_id: orgId,
      },
      data: {
        deleted_at: new Date(),
      },
    })
  }
}
