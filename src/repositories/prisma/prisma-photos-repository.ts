import { Prisma } from '@prisma/client'
import { PhotosRepository } from '../photos-repository'
import { prisma } from '@/lib/prisma'

export class PrismaPhotosRepository implements PhotosRepository {
  async getManyByPetId(petId: string) {
    const photos = await prisma.photo.findMany({
      where: {
        pet_id: petId,
      },
    })

    return photos
  }

  async create(data: Prisma.PhotoUncheckedCreateInput) {
    const photo = await prisma.photo.create({
      data,
    })

    return photo
  }

  async createMany(data: Prisma.PhotoUncheckedCreateInput[]) {
    const photos = await prisma.photo.createMany({
      data,
    })

    return photos
  }
}
