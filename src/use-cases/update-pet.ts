import { PassThrough } from 'node:stream'
import { EnergyLevel, Pet, Prisma, Size } from '@prisma/client'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'
import { generateFileHash } from '@/utils/generate-file-hash'
import { PhotosRepository } from '@/repositories/photos-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { PetPhoto } from '@/@types/pets'
import { FileStorageProvider } from '@/providers/file-storage/file-storage-provider'
import { UploadPhotoError } from './errors/upload-photo-error'
import { RemovePhotoError } from './errors/remove-photo-error'

interface UpdatePetUseCaseRequest {
  id: string
  name: string
  description: string
  ageInMonths: number
  size: Size
  energyLevel: EnergyLevel
  photos: PetPhoto[]
  adoptionRequirements: string[]
  orgId: string
}

interface UpdatePetUseCaseResponse {
  pet: Pet
}

export class UpdatePetUseCase {
  constructor(
    private petsRepository: PetsRepository,
    private orgsRepository: OrgsRepository,
    private photosRepository: PhotosRepository,
    private fileStorageProvider: FileStorageProvider,
  ) {}

  async execute({
    id,
    name,
    description,
    ageInMonths,
    size,
    energyLevel,
    photos,
    adoptionRequirements,
    orgId,
  }: UpdatePetUseCaseRequest): Promise<UpdatePetUseCaseResponse> {
    const pet = await this.petsRepository.findById(id)

    if (!pet) {
      throw new ResourceNotFoundError()
    }

    const org = await this.orgsRepository.findById(orgId)

    if (!org) {
      throw new ResourceNotFoundError()
    }

    const existingPhotos = await this.photosRepository.getManyByPetId(pet.id)

    const receivedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const fileClone = new PassThrough()
        photo.file.pipe(fileClone)
        const hash = await generateFileHash(fileClone)
        return { hash, photo }
      }),
    )

    // New photos to upload
    const receivedPhotosToUpload = receivedPhotos.filter(
      (receivedPhoto) =>
        !existingPhotos.some(
          (existingPhoto) => existingPhoto.hash === receivedPhoto.hash,
        ),
    )

    const photosToUpload: Prisma.PhotoUncheckedCreateInput[] = []

    try {
      await Promise.all(
        receivedPhotosToUpload.map(async (photoToUpload) => {
          const { file, filename, mimetype } = photoToUpload.photo

          const fileClone = new PassThrough()
          file.pipe(fileClone)

          const { fileUrl } = await this.fileStorageProvider.upload(
            id,
            fileClone,
            filename,
            mimetype,
          )

          if (!fileUrl) {
            throw new UploadPhotoError()
          }

          photosToUpload.push({
            url: fileUrl,
            hash: photoToUpload.hash,
            pet_id: id,
          })
        }),
      )
    } catch (error) {
      throw new UploadPhotoError()
    }

    // Photos to remove
    const receivedPhotosToRemove = existingPhotos.filter(
      (existingPhoto) =>
        !receivedPhotos.some(
          (receivedPhoto) => receivedPhoto.hash === existingPhoto.hash,
        ),
    )

    const photosToRemoveId: string[] = []

    try {
      await Promise.all(
        receivedPhotosToRemove.map(async (photoToRemove) => {
          const key = photoToRemove.url.split('/').pop() ?? ''
          await this.fileStorageProvider.remove(key)
          photosToRemoveId.push(photoToRemove.id)
        }),
      )
    } catch (error) {
      throw new RemovePhotoError()
    }

    await this.photosRepository.createMany(photosToUpload)

    photosToRemoveId.forEach(
      async (photoId) => await this.photosRepository.delete(photoId),
    )

    const petUpdated = await this.petsRepository.save({
      ...pet,
      name,
      description,
      age_in_months: ageInMonths,
      size,
      energy_level: energyLevel,
      adoption_requirements: adoptionRequirements,
      org_id: orgId,
      updated_at: new Date(),
    })

    return { pet: petUpdated }
  }
}
