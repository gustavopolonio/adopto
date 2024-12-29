import { Prisma, Photo } from '@prisma/client'
import { PhotosRepository } from '../photos-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryPhotosRepository implements PhotosRepository {
  public photos: Photo[] = []

  async getManyByPetId(petId: string) {
    return this.photos.filter((photo) => photo.pet_id === petId)
  }

  async create(data: Prisma.PhotoUncheckedCreateInput) {
    const photo = {
      id: randomUUID(),
      hash: data.hash,
      s3_url: data.s3_url,
      pet_id: data.pet_id,
    }

    this.photos.push(photo)

    return photo
  }

  async createMany(data: Prisma.PhotoUncheckedCreateInput[]) {
    const photos = data.map((photo) => ({
      id: randomUUID(),
      hash: photo.hash,
      s3_url: photo.s3_url,
      pet_id: photo.pet_id,
    }))

    this.photos.push(...photos)

    return { count: photos.length }
  }
}
