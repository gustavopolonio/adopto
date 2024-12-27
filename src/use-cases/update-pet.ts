import { MultipartFile } from '@fastify/multipart'
import { EnergyLevel, Pet, Size } from '@prisma/client'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'
import { generateFileHash } from '@/utils/generate-file-hash'
import { PhotosRepository } from '@/repositories/photos-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { uploadFileToS3 } from '@/utils/upload-file-to-s3'

interface PetPhoto {
  file: MultipartFile
}

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

    const existingPhotos = await this.photosRepository.getManyByPetId(pet.id)

    for (const photo of photos) {
      const photoHash = generateFileHash(photo.file.filename)

      const existingPhoto = existingPhotos.find(
        (existingPhoto) => existingPhoto.hash === photoHash,
      )

      if (!existingPhoto) {
        try {
          const uploadedFile = await uploadFileToS3(photo.file)

          await this.photosRepository.create({
            s3_url: uploadedFile.Location!,
            hash: photoHash,
            pet_id: pet.id,
          })
        } catch (error) {
          console.error('Error uploadind files', error)
          throw error
        }
      }
    }

    return { pet: petUpdated }
  }
}
