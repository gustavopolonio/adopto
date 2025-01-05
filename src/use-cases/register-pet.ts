import { PassThrough } from 'node:stream'
import { Pet, Prisma } from '@prisma/client'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'
import { PhotosRepository } from '@/repositories/photos-repository'
import { FileStorageProvider } from '@/providers/file-storage/file-storage-provider'
import { generateFileHash } from '@/utils/generate-file-hash'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UploadPhotoError } from './errors/upload-photo-error'
import { RegisterPetInput } from '@/@types/pets'

interface RegisterPetUseCaseRequest extends RegisterPetInput {}

interface RegisterPetUseCaseResponse {
  pet: Pet
}

export class RegisterPetUseCase {
  constructor(
    private petsRepository: PetsRepository,
    private orgsRepository: OrgsRepository,
    private photosRepository: PhotosRepository,
    private fileStorageProvider: FileStorageProvider,
  ) {}

  async execute({
    name,
    description,
    ageInMonths,
    size,
    energyLevel,
    photos,
    adoptionRequirements,
    orgId,
  }: RegisterPetUseCaseRequest): Promise<RegisterPetUseCaseResponse> {
    const org = await this.orgsRepository.findById(orgId)

    if (!org) {
      throw new ResourceNotFoundError()
    }

    const photosToUpload: Prisma.PhotoUncheckedCreateInput[] = []

    try {
      await Promise.all(
        photos.map(async (photo) => {
          const { file, filename, mimetype } = photo

          const fileCloneToStore = new PassThrough()
          const fileCloneToHash = new PassThrough()
          file.pipe(fileCloneToStore).pipe(fileCloneToHash)

          const { fileUrl } = await this.fileStorageProvider.upload(
            fileCloneToStore,
            filename,
            mimetype,
          )

          if (!fileUrl) {
            throw new UploadPhotoError()
          }

          const hash = await generateFileHash(fileCloneToHash)

          photosToUpload.push({
            url: fileUrl,
            hash,
            pet_id: '',
          })
        }),
      )
    } catch (error) {
      throw new UploadPhotoError()
    }

    const pet = await this.petsRepository.create({
      name,
      description,
      age_in_months: ageInMonths,
      size,
      energy_level: energyLevel,
      adoption_requirements: adoptionRequirements,
      org_id: orgId,
    })

    photosToUpload.forEach((photo) => (photo.pet_id = pet.id))

    await this.photosRepository.createMany(photosToUpload)

    return { pet }
  }
}
