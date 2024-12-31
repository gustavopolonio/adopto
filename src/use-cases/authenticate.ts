import { Org } from '@prisma/client'
import { compare } from 'bcryptjs'
import { OrgsRepository } from '@/repositories/orgs-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { AuthenticateOrgInput } from '@/@types/orgs'

interface AuthenticateRequest extends AuthenticateOrgInput {}

interface AuthenticateResponse {
  org: Org
}

export class AuthenticateUseCase {
  constructor(private orgsRepository: OrgsRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateRequest): Promise<AuthenticateResponse> {
    const org = await this.orgsRepository.findByEmail(email)

    if (!org) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, org.password_hash)

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    return { org }
  }
}
