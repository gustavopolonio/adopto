import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { register } from './register'
import { authenticate } from './authenticate'
import { remove } from './remove'
import { update } from './update'

export async function orgsRoutes(app: FastifyInstance) {
  app.post('/orgs', register)
  app.post('/sessions', authenticate)

  // Authenticated
  app.put('/orgs', { onRequest: [verifyJwt] }, update)
  app.delete('/orgs', { onRequest: [verifyJwt] }, remove)
}
