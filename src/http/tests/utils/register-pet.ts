import path from 'path'
import request from 'supertest'
import { app } from '@/app'
import { RegisterPetInput } from '@/@types/pets'

export async function registerPet(
  token: string,
  customData: Partial<RegisterPetInput> = {},
) {
  const photo1 = path.join(__dirname, '..', 'cat.jpg')
  const photo2 = path.join(__dirname, '..', 'dog.jpg')

  const defaultData = {
    name: 'Pet 1',
    description: 'Description 1',
    ageInMonths: 10,
    size: 'MEDIUM',
    energyLevel: 'MEDIUM',
    photos: [photo1, photo2],
    adoptionRequirements: [],
    orgId: '',
  }

  const petData = { ...defaultData, ...customData }

  const response = await request(app.server)
    .post('/pets')
    .set('Authorization', `Bearer ${token}`)
    .field('name', petData.name)
    .field('description', petData.description)
    .field('ageInMonths', petData.ageInMonths)
    .field('size', petData.size)
    .field('energyLevel', petData.energyLevel)
    .field('adoptionRequirements', JSON.stringify(petData.adoptionRequirements))
    .attach('photos', photo1)
    .attach('photos', photo2)

  if (response.status !== 201) {
    throw new Error(`Failed to register pet: ${response.text}`)
  }

  return petData
}
