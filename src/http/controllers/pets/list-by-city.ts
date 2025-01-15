import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetPetsFromCityUseCase } from '@/use-cases/factories/make-get-pets-from-city-use-case'

export async function listByCity(request: FastifyRequest, reply: FastifyReply) {
  const listPetsByCityQuerySchema = z.object({
    city: z.string(),
    page: z.coerce.number().min(1).default(1),
    sortBy: z.enum(['mostRecent']).optional(),
    minAge: z.coerce.number().int(),
    maxAge: z.coerce.number().int(),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
    energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  })

  const { city, page, sortBy, minAge, maxAge, size, energyLevel } =
    listPetsByCityQuerySchema.parse(request.query)

  const getPetsFromCityUseCase = makeGetPetsFromCityUseCase()

  const { pets } = await getPetsFromCityUseCase.execute({
    city,
    page,
    sortBy,
    ageInMonths: {
      min: minAge,
      max: maxAge,
    },
    size,
    energyLevel,
  })

  return reply.status(200).send({ pets })
}
