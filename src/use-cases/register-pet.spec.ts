import { Readable } from 'node:stream'
import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { RegisterPetUseCase } from './register-pet'
import { MockFileSorageProvider } from '@/providers/file-storage/implementations/mock-file-storage-provider'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { InMemoryPhotosRepository } from '@/repositories/in-memory/in-memory-photos-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UploadPhotoError } from './errors/upload-photo-error'
import { PetPhoto } from '@/@types/pets'

function createDummyFile(fileData = 'dummy data') {
  const fileStream = new Readable()
  fileStream.push(fileData)
  fileStream.push(null)
  return fileStream
}

const mockedPhotos: PetPhoto[] = [
  {
    file: createDummyFile(),
    filename: 'photo1.jpg',
    mimetype: 'image/jpeg',
  },
  {
    file: createDummyFile(),
    filename: 'photo2.jpg',
    mimetype: 'image/jpg',
  },
  {
    file: createDummyFile('dummy data 3'),
    filename: 'photo3.jpg',
    mimetype: 'image/png',
  },
]

let petsRepository: InMemoryPetsRepository
let orgsRepository: InMemoryOrgsRepository
let photosRepository: InMemoryPhotosRepository
let fileStorageProvider: MockFileSorageProvider
let sut: RegisterPetUseCase

describe('Register pet use case', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    orgsRepository = new InMemoryOrgsRepository()
    photosRepository = new InMemoryPhotosRepository()
    fileStorageProvider = new MockFileSorageProvider()
    sut = new RegisterPetUseCase(
      petsRepository,
      orgsRepository,
      photosRepository,
      fileStorageProvider,
    )
  })

  it('should be able to register a pet', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const { pet } = await sut.execute({
      orgId: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      ageInMonths: 12,
      size: 'MEDIUM',
      energyLevel: 'HIGH',
      photos: mockedPhotos,
      adoptionRequirements: ['Requirement 1'],
    })

    expect(pet.id).toEqual(expect.any(String))
    expect(photosRepository.photos).toEqual([
      expect.objectContaining({
        pet_id: pet.id,
        url: `http://mock-storage/${mockedPhotos[0].filename}`,
      }),
      expect.objectContaining({
        pet_id: pet.id,
        url: `http://mock-storage/${mockedPhotos[1].filename}`,
      }),
      expect.objectContaining({
        pet_id: pet.id,
        url: `http://mock-storage/${mockedPhotos[2].filename}`,
      }),
    ])
    expect(photosRepository.photos[0].hash).toEqual(
      photosRepository.photos[1].hash,
    )
  })

  it('should not be able to register a pet that is not linked with an org', async () => {
    await expect(
      sut.execute({
        orgId: 'non-existing-org-id',
        name: 'Pet 1',
        description: 'Description 1',
        ageInMonths: 12,
        size: 'MEDIUM',
        energyLevel: 'HIGH',
        photos: mockedPhotos,
        adoptionRequirements: ['Requirement 1'],
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to register a pet if file upload fails', async () => {
    fileStorageProvider.shouldUploadFail = true

    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    await expect(
      sut.execute({
        orgId: org.id,
        name: 'Pet 1',
        description: 'Description 1',
        ageInMonths: 12,
        size: 'MEDIUM',
        energyLevel: 'HIGH',
        photos: mockedPhotos,
        adoptionRequirements: ['Requirement 1'],
      }),
    ).rejects.toBeInstanceOf(UploadPhotoError)
  })
})
