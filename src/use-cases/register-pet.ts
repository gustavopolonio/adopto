import { EnergyLevel, Pet, Prisma, Size } from '@prisma/client'
import { MultipartFile } from '@fastify/multipart'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { PetsRepository } from '@/repositories/pets-repository'
import { PhotosRepository } from '@/repositories/photos-repository'
import { generateFileHash } from '@/utils/generate-file-hash'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { uploadFileToS3 } from '@/utils/upload-file-to-s3'

export interface PetPhoto {
  file: MultipartFile
}

interface RegisterPetUseCaseRequest {
  name: string
  description: string
  ageInMonths: number
  size: Size
  energyLevel: EnergyLevel
  photos: PetPhoto[]
  adoptionRequirements: string[]
  orgId: string
}

interface RegisterPetUseCaseResponse {
  pet: Pet
}

export class RegisterPetUseCase {
  constructor(
    private petsRepository: PetsRepository,
    private orgsRepository: OrgsRepository,
    private photosRepository: PhotosRepository,
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

    const pet = await this.petsRepository.create({
      name,
      description,
      age_in_months: ageInMonths,
      size,
      energy_level: energyLevel,
      adoption_requirements: adoptionRequirements,
      org_id: orgId,
    })

    const photosToUpload: Prisma.PhotoUncheckedCreateInput[] = []

    async function uploadFiles() {
      try {
        await Promise.all(
          photos.map(async (photo) => {
            const uploadedFile = await uploadFileToS3(photo.file)
            const hash = generateFileHash(photo.file.filename)

            photosToUpload.push({
              s3_url: uploadedFile.Location!,
              hash,
              pet_id: pet.id,
            })
          }),
        )
      } catch (error) {
        console.error('Error uploadind files', error)
        throw error
      }
    }

    await uploadFiles()
    await this.photosRepository.createMany(photosToUpload)

    return { pet }
  }
}
