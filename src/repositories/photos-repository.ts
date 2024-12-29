import { Photo, Prisma } from '@prisma/client'

export interface PhotosRepository {
  getManyByPetId(petId: string): Promise<Photo[] | []>
  create(data: Prisma.PhotoUncheckedCreateInput): Promise<Photo>
  createMany(
    data: Prisma.PhotoUncheckedCreateInput[],
  ): Promise<{ count: number }>
}
