import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeUpdateOrgUseCase } from '@/use-cases/factories/make-update-org-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const orgId = request.user.sub

  const updateOrgBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    zipCode: z.string(),
    address: z.string(),
    city: z.string(),
    whatsapp: z.string(),
  })

  const { name, email, password, zipCode, address, city, whatsapp } =
    updateOrgBodySchema.parse(request.body)

  const updateOrgUseCase = makeUpdateOrgUseCase()

  try {
    await updateOrgUseCase.execute({
      id: orgId,
      name,
      email,
      password,
      zipCode,
      address,
      city,
      whatsapp,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}
