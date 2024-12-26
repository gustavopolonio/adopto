import fastify from 'fastify'
import { ZodError } from 'zod'
import 'dotenv/config'
import { env } from './env'

const app = fastify()

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

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`Server running on port: ${env.PORT}`)
  })
