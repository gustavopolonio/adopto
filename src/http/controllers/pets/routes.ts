import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { register } from './register'
import { update } from './update'
import { profile } from './profile'

export async function petsRoutes(app: FastifyInstance) {
  app.get('/pets/:petId', profile)

  // Authenticated
  app.post('/pets', { onRequest: [verifyJwt] }, register)
  app.put('/pets/:petId', { onRequest: [verifyJwt] }, update)
}
