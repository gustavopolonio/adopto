import { FastifyInstance } from 'fastify'
import { register } from './register'
import { verifyJwt } from '@/http/middlewares/verify-jwt'

export async function petsRoutes(app: FastifyInstance) {
  // Authenticated
  app.post('/pets', { onRequest: [verifyJwt] }, register)
}
