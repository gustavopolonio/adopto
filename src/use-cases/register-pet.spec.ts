import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hash } from 'bcryptjs'
import * as fs from 'fs'
import { Upload } from '@aws-sdk/lib-storage'
import { MultipartFile } from '@fastify/multipart'
import { InMemoryOrgsRepository } from '@/repositories/in-memory/in-memory-orgs-repository'
import { InMemoryPetsRepository } from '@/repositories/in-memory/in-memory-pets-repository'
import { RegisterPetUseCase } from './register-pet'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { InMemoryPhotosRepository } from '@/repositories/in-memory/in-memory-photos-repository'

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

let petsRepository: InMemoryPetsRepository
let orgsRepository: InMemoryOrgsRepository
let photosRepository: InMemoryPhotosRepository
let sut: RegisterPetUseCase

describe('Register pet use case', () => {
  beforeEach(() => {
    petsRepository = new InMemoryPetsRepository()
    orgsRepository = new InMemoryOrgsRepository()
    photosRepository = new InMemoryPhotosRepository()
    sut = new RegisterPetUseCase(
      petsRepository,
      orgsRepository,
      photosRepository,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
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
    expect(Upload).toHaveBeenCalledTimes(2)
    expect(fs.createReadStream).toHaveBeenCalledTimes(2)
    expect(fs.createReadStream).toHaveBeenCalledWith('photo1.jpg')
    expect(fs.createReadStream).toHaveBeenCalledWith('photo2.jpg')
    expect(photosRepository.photos).toEqual([
      expect.objectContaining({
        s3_url: 'mocked-s3-url',
      }),
      expect.objectContaining({
        s3_url: 'mocked-s3-url',
      }),
    ])
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

    expect(Upload).toHaveBeenCalledTimes(0)
    expect(fs.createReadStream).toHaveBeenCalledTimes(0)
  })
})
