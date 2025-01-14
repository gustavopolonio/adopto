import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { makeGetPetProfileUseCase } from '@/use-cases/factories/make-get-pet-profile-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  const getPetProfileParamsSchema = z.object({
    petId: z.string().uuid(),
  })

  const { petId } = getPetProfileParamsSchema.parse(request.params)

  const getPetProfileUseCase = makeGetPetProfileUseCase()

  try {
    const { pet } = await getPetProfileUseCase.execute({
      id: petId,
    })

    return reply.status(200).send({ pet })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
