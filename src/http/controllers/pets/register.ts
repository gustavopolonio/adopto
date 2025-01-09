import { Readable } from 'node:stream'
import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { makeRegisterPetUseCase } from '@/use-cases/factories/make-register-pet-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UploadPhotoError } from '@/use-cases/errors/upload-photo-error'
import { MAX_FILE_SIZE } from '@/utils/constants'
import {
  PetPhoto,
  RegisterPetInputKeys,
  RegisterPetInputValues,
} from '@/@types/pets'

const fileSchema = z.object({
  file: z.instanceof(Readable),
  filename: z.string(),
  mimetype: z.string().refine((type) => {
    return ['image/jpeg', 'image/jpg', 'image/png'].includes(type)
  }, 'Only .jpeg, .jpg, .png formats are supported.'),
})

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerPetBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    ageInMonths: z.coerce.number().min(1),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
    energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    photos: z.array(fileSchema).min(1),
    adoptionRequirements: z.array(z.string()),
  })

  const formData: Partial<
    Record<RegisterPetInputKeys, RegisterPetInputValues>
  > = {}
  const photos: PetPhoto[] = []

  const parts = request.parts()

  for await (const part of parts) {
    if (part.type === 'file') {
      let fileSize = 0
      const chunks: Buffer[] = []

      await new Promise<void>((resolve, reject) => {
        part.file.on('data', (chunk) => {
          fileSize += chunk.length

          if (fileSize > MAX_FILE_SIZE) {
            part.file.destroy()
          } else {
            chunks.push(chunk)
          }
        })

        part.file.on('end', resolve)
        part.file.on('error', reject)
      })

      if (fileSize <= MAX_FILE_SIZE) {
        const fileBuffer = Buffer.concat(chunks)
        photos.push({
          file: Readable.from(fileBuffer),
          filename: part.filename,
          mimetype: part.mimetype,
        })
      }
    } else {
      const fieldName = part.fieldname as RegisterPetInputKeys
      const value = part.value as RegisterPetInputValues
      formData[fieldName] = value
    }
  }

  formData.photos = photos

  const {
    name,
    description,
    ageInMonths,
    size,
    energyLevel,
    photos: parsedPhotos,
    adoptionRequirements,
  } = registerPetBodySchema.parse({
    ...formData,
    adoptionRequirements: JSON.parse(formData.adoptionRequirements as string),
  })

  const registerPetUseCase = makeRegisterPetUseCase()
  const orgId = request.user.sub

  try {
    await registerPetUseCase.execute({
      name,
      description,
      ageInMonths,
      size,
      energyLevel,
      photos: parsedPhotos,
      adoptionRequirements,
      orgId,
    })

    return reply.status(201).send()
  } catch (error) {
    if (
      error instanceof ResourceNotFoundError ||
      error instanceof UploadPhotoError
    ) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}
