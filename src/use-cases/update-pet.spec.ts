import * as fs from 'fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { UpdatePetUseCase } from './update-pet'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { InMemoryPhotosRepository } from '@/repositories/in-memory/in-memory-photos-repository'
import { MultipartFile } from '@fastify/multipart'
import { randomUUID } from 'node:crypto'
import { Upload } from '@aws-sdk/lib-storage'
import { generateFileHash } from '../utils/generate-file-hash'

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: vi.fn().mockImplementation(() => ({
    done: vi.fn().mockResolvedValue({ Location: 'mocked-s3-url' }),
  })),
}))

vi.mock('fs', () => ({
  createReadStream: vi
    .fn()
    .mockImplementation((filePath) => `stream-of-${filePath}`),
  readFileSync: vi
    .fn()
    .mockImplementation((filePath) =>
      Buffer.from(`mock-content-of-${filePath}`),
    ),
}))

const mockedPhotos = [
  {
    file: {
      filename: 'photo1.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
    } as MultipartFile,
  },
  {
    file: {
      filename: 'photo2.jpg',
      mimetype: 'image/jpeg',
      encoding: '7bit',
    } as MultipartFile,
  },
]

let orgsRepository: InMemoryOrgsRepository
let petsRepository: InMemoryPetsRepository
let photosRepository: InMemoryPhotosRepository
let sut: UpdatePetUseCase

describe('Update pet use case', () => {
  beforeEach(() => {
    orgsRepository = new InMemoryOrgsRepository()
    petsRepository = new InMemoryPetsRepository()
    photosRepository = new InMemoryPhotosRepository()
    sut = new UpdatePetUseCase(petsRepository, orgsRepository, photosRepository)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should be able to update a pet', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: '123456',
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const petCreated = await petsRepository.create({
      name: 'Pet 1',
      description: 'Pet 1 description',
      age_in_months: 10,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
      org_id: org.id,
    })

    await photosRepository.create({
      pet_id: petCreated.id,
      hash: randomUUID(),
      s3_url: 's3-url.com',
    })

    const { pet } = await sut.execute({
      id: petCreated.id,
      name: 'Pet 1 updated',
      description: 'Pet 1 description updated',
      ageInMonths: 12,
      size: 'SMALL',
      energyLevel: 'LOW',
      photos: mockedPhotos,
      adoptionRequirements: ['Requirement 2'],
      orgId: petCreated.org_id,
    })

    expect(pet).toEqual(
      expect.objectContaining({
        id: petCreated.id,
        org_id: org.id,
        name: 'Pet 1 updated',
      }),
    )
    expect(Upload).toHaveBeenCalledTimes(2)
    expect(fs.createReadStream).toHaveBeenCalledTimes(2)
    expect(fs.createReadStream).toHaveBeenCalledWith('photo1.jpg')
    expect(fs.createReadStream).toHaveBeenCalledWith('photo2.jpg')
    expect(photosRepository.photos).toEqual([
      expect.objectContaining({
        s3_url: 's3-url.com',
      }),
      expect.objectContaining({
        s3_url: 'mocked-s3-url',
      }),
      expect.objectContaining({
        s3_url: 'mocked-s3-url',
      }),
    ])
  })

  it('should not be able to update an unexisting pet', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: '123456',
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    await expect(
      sut.execute({
        id: 'non-existing-pet-id',
        name: 'Pet 1 updated',
        description: 'Pet 1 description updated',
        ageInMonths: 12,
        size: 'SMALL',
        energyLevel: 'LOW',
        photos: mockedPhotos,
        adoptionRequirements: ['Requirement 2'],
        orgId: org.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(Upload).toHaveBeenCalledTimes(0)
  })

  it('should not be able to update a pet of an unexisting org', async () => {
    const pet = await petsRepository.create({
      name: 'Pet 1',
      description: 'Pet 1 description',
      age_in_months: 10,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      photos: ['photo1.jpg'],
      adoption_requirements: ['Requirement 1'],
      org_id: 'non-existing-org-id',
    })

    await expect(
      sut.execute({
        id: pet.id,
        name: 'Pet 1 updated',
        description: 'Pet 1 description updated',
        ageInMonths: 12,
        size: 'SMALL',
        energyLevel: 'LOW',
        photos: mockedPhotos,
        adoptionRequirements: ['Requirement 2'],
        orgId: pet.org_id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)

    expect(Upload).toHaveBeenCalledTimes(0)
  })

  it('should be able to update a pet without change repeated photos', async () => {
    const org = await orgsRepository.create({
      name: 'Org 1',
      email: 'org1@test.test',
      password_hash: '123456',
      zip_code: '13566-583',
      address: 'Rua Tomaz Antonio Gonzaga, 382',
      city: 'São Carlos',
      whatsapp: '16 99399-0990',
    })

    const petCreated = await petsRepository.create({
      name: 'Pet 1',
      description: 'Pet 1 description',
      age_in_months: 10,
      size: 'MEDIUM',
      energy_level: 'HIGH',
      adoption_requirements: ['Requirement 1'],
      org_id: org.id,
    })

    const photoFilename = 'photo1.jpg'

    await photosRepository.create({
      pet_id: petCreated.id,
      hash: generateFileHash(photoFilename),
      s3_url: 's3-url.com',
    })

    const { pet } = await sut.execute({
      id: petCreated.id,
      name: 'Pet 1 updated',
      description: 'Pet 1 description updated',
      ageInMonths: 12,
      size: 'SMALL',
      energyLevel: 'LOW',
      photos: [
        {
          file: {
            filename: photoFilename,
            mimetype: 'image/jpeg',
            encoding: '7bit',
          } as MultipartFile,
        },
      ],
      adoptionRequirements: ['Requirement 2'],
      orgId: petCreated.org_id,
    })

    expect(pet).toEqual(
      expect.objectContaining({
        id: petCreated.id,
        org_id: org.id,
        name: 'Pet 1 updated',
      }),
    )
    expect(Upload).toHaveBeenCalledTimes(0)
    expect(fs.createReadStream).toHaveBeenCalledTimes(0)
    expect(photosRepository.photos).toEqual([
      expect.objectContaining({
        s3_url: 's3-url.com',
      }),
    ])
  })
})
