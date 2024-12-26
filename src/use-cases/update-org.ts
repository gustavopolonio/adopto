import { Org, Prisma } from '@prisma/client'
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { hash } from 'bcryptjs'
import { env } from '@/env'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

interface UpdateOrgUseCaseRequest {
  id: string
  name: string
  email: string
  password: string
  zipCode: string
  address: string
  city: string
  whatsapp: string
}

interface UpdateOrgUseCaseResponse {
  org: Org
}

export class UpdateOrgUseCase {
  constructor(private orgsRepository: OrgsRepository) {}

  async execute({
    id,
    name,
    email,
    password,
    zipCode,
    address,
    city,
    whatsapp,
  }: UpdateOrgUseCaseRequest): Promise<UpdateOrgUseCaseResponse> {
    const org = await this.orgsRepository.findById(id)
    if (!org) {
      throw new ResourceNotFoundError()
    }

    const emailAlreadyExists = await this.orgsRepository.findByEmail(email)
    if (emailAlreadyExists && emailAlreadyExists.id !== id) {
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

    const orgUpdated = await this.orgsRepository.save({
      ...org,
      name,
      email,
      password_hash: passwordHash,
      zip_code: zipCode,
      address,
      city,
      whatsapp,
      latitude: location ? new Prisma.Decimal(location.lat) : null,
      longitude: location ? new Prisma.Decimal(location.lng) : null,
    })

    return { org: orgUpdated }
  }
}
