import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { ZodError } from 'zod'
import { env } from './env'
import { orgsRoutes } from './http/controllers/orgs/routes'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(orgsRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.format(),
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error' })
})
