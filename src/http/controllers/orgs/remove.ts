import { FastifyReply, FastifyRequest } from 'fastify'
import { makeDeleteOrgUseCase } from '@/use-cases/factories/make-delete-org-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteOrgUseCase = makeDeleteOrgUseCase()
  const orgId = request.user.sub

  try {
    await deleteOrgUseCase.execute({
      id: orgId,
    })
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }

  return reply.status(204).send()
}
