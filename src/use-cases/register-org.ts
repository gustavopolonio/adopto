import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js'
import { Org } from '@prisma/client'
import { hash } from 'bcryptjs'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { env } from '@/env'
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

    const mapsClient = new GoogleMapsClient({})
    const geocodeResponse = await mapsClient.geocode({
      params: {
        key: env.GOOGLE_MAPS_API_KEY,
        address: `${zipCode}, ${address}, ${city}`,
      },
    })
    const location = geocodeResponse.data.results[0]?.geometry.location

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
