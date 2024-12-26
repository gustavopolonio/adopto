import { Org } from '@prisma/client'
import { hash } from 'bcryptjs'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { geocodeAddress } from '@/utils/geocode-address'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

interface RegisterOrgUseCaseRequest {
  name: string
  email: string
  password: string
  zipCode: string
  address: string
  city: string
  whatsapp: string
}

interface RegisterOrgUseCaseResponse {
  org: Org
}

export class RegisterOrgUseCase {
  constructor(private orgsRepository: OrgsRepository) {}

  async execute({
    name,
    email,
    password,
    zipCode,
    address,
    city,
    whatsapp,
  }: RegisterOrgUseCaseRequest): Promise<RegisterOrgUseCaseResponse> {
    const emailAlreadyExists = await this.orgsRepository.findByEmail(email)

    if (emailAlreadyExists) {
      throw new UserAlreadyExistsError()
    }

    const passwordHash = await hash(password, 6)

    const location = await geocodeAddress({
      zipCode,
      address,
      city,
    })

    const org = await this.orgsRepository.create({
      name,
      email,
      password_hash: passwordHash,
      zip_code: zipCode,
      address,
      city,
      whatsapp,
      latitude: location ? location.lat : null,
      longitude: location ? location.lng : null,
    })

    return { org }
  }
}
