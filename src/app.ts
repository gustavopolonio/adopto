import fastify from 'fastify'
import 'dotenv/config'
import { env } from './env'

const app = fastify()

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`Server running on port: ${env.PORT}`)
  })
