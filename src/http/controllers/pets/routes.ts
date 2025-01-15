import { FastifyInstance } from 'fastify'
import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { register } from './register'
import { update } from './update'
import { profile } from './profile'
import { remove } from './remove'
import { listByCity } from './list-by-city'

export async function petsRoutes(app: FastifyInstance) {
  app.get('/pets/:petId', profile)
  app.get('/pets', listByCity)

  // Authenticated
  app.post('/pets', { onRequest: [verifyJwt] }, register)
  app.put('/pets/:petId', { onRequest: [verifyJwt] }, update)
  app.delete('/pets/:petId', { onRequest: [verifyJwt] }, remove)
}
