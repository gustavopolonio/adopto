import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeDeletePetUseCase } from '@/use-cases/factories/make-delete-pet-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized.error'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const orgId = request.user.sub

  const deletePetParamsSchema = z.object({
    petId: z.string().uuid(),
  })

  const { petId } = deletePetParamsSchema.parse(request.params)

  const deletePetUseCase = makeDeletePetUseCase()

  try {
    await deletePetUseCase.execute({
      id: petId,
      orgId,
    })

    return reply.status(204).send()
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message })
    }

    throw error
  }
}
