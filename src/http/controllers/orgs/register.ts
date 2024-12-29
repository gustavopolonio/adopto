import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists-error'
import { makeRegisterOrgUseCase } from '@/use-cases/factories/make-register-org-use-case'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    zipCode: z.string(),
    address: z.string(),
    city: z.string(),
    whatsapp: z.string(),
  })

  const { name, email, password, zipCode, address, city, whatsapp } =
    registerBodySchema.parse(request.body)

  const registerOrgUseCase = makeRegisterOrgUseCase()

  try {
    await registerOrgUseCase.execute({
      name,
      email,
      password,
      zipCode,
      address,
      city,
      whatsapp,
    })
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }

  return reply.status(201).send()
}
