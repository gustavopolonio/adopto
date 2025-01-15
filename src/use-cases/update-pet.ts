import { Pet, Prisma } from '@prisma/client'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'
import { generateFileHash } from '@/utils/generate-file-hash'
import { PhotosRepository } from '@/repositories/photos-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UpdatePetInput } from '@/@types/pets'
import { FileStorageProvider } from '@/providers/file-storage/file-storage-provider'
import { UploadPhotoError } from './errors/upload-photo-error'
import { RemovePhotoError } from './errors/remove-photo-error'
import { UnauthorizedError } from './errors/unauthorized.error'

interface UpdatePetUseCaseRequest extends UpdatePetInput {}

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

    if (pet.org_id !== orgId) {
      throw new UnauthorizedError()
    }

    const existingPhotos = await this.photosRepository.getManyByPetId(pet.id)

    const receivedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const chunks: Buffer[] = []

        for await (const chunk of photo.file) {
          chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)
        const hash = generateFileHash(buffer)
        return { hash, photo, buffer }
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
          const { filename, mimetype } = photoToUpload.photo

          const { fileUrl, fileKey } = await this.fileStorageProvider.upload(
            id,
            photoToUpload.buffer,
            filename,
            mimetype,
          )

          if (!fileUrl || !fileKey) {
            throw new UploadPhotoError()
          }

          photosToUpload.push({
            key: fileKey,
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
          await this.fileStorageProvider.remove(photoToRemove.key)
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
