import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { UpdatePetUseCase } from './update-pet'
import { MockFileSorageProvider } from '@/providers/file-storage/implementations/mock-file-storage-provider'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { InMemoryPhotosRepository } from '@/repositories/in-memory/in-memory-photos-repository'
import { generateFileHash } from '@/utils/generate-file-hash'
import { createDummyFile } from './tests/utils/create-dummy-file'
import { PetPhoto } from '@/@types/pets'

let petsRepository: InMemoryPetsRepository
let orgsRepository: InMemoryOrgsRepository
let photosRepository: InMemoryPhotosRepository
let fileStorageProvider: MockFileSorageProvider
let sut: UpdatePetUseCase

const mockedPhotos: PetPhoto[] = [
  {
    file: createDummyFile('Dummy file 1'),
    filename: 'photo1.jpg',
    mimetype: 'image/jpeg',
  },
  {
    file: createDummyFile('Dummy file 3'),
    filename: 'photo3.jpg',
    mimetype: 'image/png',
  },
]

describe('Update pet use case', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    orgsRepository = new InMemoryOrgsRepository()
    photosRepository = new InMemoryPhotosRepository()
    fileStorageProvider = new MockFileSorageProvider()
    sut = new UpdatePetUseCase(
      petsRepository,
      orgsRepository,
      photosRepository,
      fileStorageProvider,
    )
  })

  it('should be able to update a pet without files change', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const petCreated = await petsRepository.create({
      org_id: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    const { pet } = await sut.execute({
      id: petCreated.id,
      name: 'New pet 1',
      description: 'Description 1',
      ageInMonths: 10,
      size: 'MEDIUM',
      energyLevel: 'LOW',
      adoptionRequirements: ['Requirement 2'],
      orgId: org.id,
      photos: [],
    })

    expect(pet.id).toEqual(petCreated.id)
    expect(petsRepository.pets[0]).toEqual(
      expect.objectContaining({
        id: petCreated.id,
        name: 'New pet 1',
        description: 'Description 1',
        age_in_months: 10,
        size: 'MEDIUM',
        energy_level: 'LOW',
        adoption_requirements: ['Requirement 2'],
        org_id: org.id,
      }),
    )
    expect(photosRepository.photos).toHaveLength(0)
  })

  it.only('should be able to update a pet with files change', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: await hash('123456', 6),
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const petCreated = await petsRepository.create({
      org_id: org.id,
      name: 'Pet 1',
      description: 'Description 1',
      age_in_months: 12,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
    })

    await photosRepository.createMany([
      {
        pet_id: petCreated.id,
        hash: await generateFileHash(createDummyFile('Dummy file 1')),
        url: 'http://mock-storage/photo1.jpg',
      },
      {
        pet_id: petCreated.id,
        hash: await generateFileHash(createDummyFile('Dummy file 2')),
        url: 'http://mock-storage/photo2.jpg',
      },
    ])

    const { pet } = await sut.execute({
      id: petCreated.id,
      name: 'New pet 1',
      description: 'Description 1',
      ageInMonths: 10,
      size: 'MEDIUM',
      energyLevel: 'LOW',
      adoptionRequirements: ['Requirement 2'],
      orgId: org.id,
      photos: mockedPhotos,
    })

    expect(pet.id).toEqual(petCreated.id)
    expect(petsRepository.pets[0]).toEqual(
      expect.objectContaining({
        id: petCreated.id,
        name: 'New pet 1',
        description: 'Description 1',
        age_in_months: 10,
        size: 'MEDIUM',
        energy_level: 'LOW',
        adoption_requirements: ['Requirement 2'],
        org_id: org.id,
      }),
    )
    expect(photosRepository.photos).toHaveLength(2)
    expect(photosRepository.photos).toEqual([
      expect.objectContaining({
        pet_id: pet.id,
        hash: await generateFileHash(createDummyFile('Dummy file 1')),
        url: 'http://mock-storage/photo1.jpg',
      }),
      expect.objectContaining({
        pet_id: pet.id,
        hash: await generateFileHash(createDummyFile('Dummy file 3')),
        url: 'http://mock-storage/photo3.jpg',
      }),
    ])
  })

  // it('should not be able to update an unexisting pet', async () => {})

  // it('should not be able to update a pet of an unexisting org', async () => {})

  // it('should not be able to update a pet if file upload fails', async () => {})

  // it('should not be able to update a pet if file deletion fails', async () => {})
})
