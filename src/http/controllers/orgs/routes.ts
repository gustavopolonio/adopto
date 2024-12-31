import { FastifyInstance } from 'fastify'
import { register } from './register'
import { authenticate } from './authenticate'
import { remove } from './remove'
import { verifyJwt } from '@/http/middlewares/verify-jwt'

export async function orgsRoutes(app: FastifyInstance) {
  app.post('/orgs', register)
  app.post('/sessions', authenticate)

  // Authenticated
  app.delete('/orgs', { onRequest: [verifyJwt] }, remove)
}
