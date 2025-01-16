import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { MAX_FILE_SIZE } from '@/utils/constants'
import { convertReadableToBuffer } from '@/utils/convert-readable-to-buffer'
import { makeUpdatePetUseCase } from '@/use-cases/factories/make-update-pet-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'
import { UploadPhotoError } from '@/use-cases/errors/upload-photo-error'
import { RemovePhotoError } from '@/use-cases/errors/remove-photo-error'
import { UnauthorizedError } from '@/use-cases/errors/unauthorized.error'
import {
  PetPhoto,
  UpdatePetInputKeys,
  UpdatePetInputValues,
} from '@/@types/pets'

const fileSchema = z.object({
  buffer: z
    .instanceof(Buffer)
    .refine((buffer) => buffer.length <= MAX_FILE_SIZE, {
      message: 'File size limit reached 1111',
    }),
  filename: z.string(),
  mimetype: z.string().refine((type) => {
    return ['image/jpeg', 'image/jpg', 'image/png'].includes(type)
  }, 'Only .jpeg, .jpg, .png formats are supported.'),
})

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const orgId = request.user.sub

  const updatePetParamsSchema = z.object({
    petId: z.string().uuid(),
  })

  const { petId } = updatePetParamsSchema.parse(request.params)

  const updatePetBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    ageInMonths: z.coerce.number().min(1),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
    energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    photos: z.array(fileSchema).min(1),
    adoptionRequirements: z.array(z.string()),
  })

  const formData: Partial<Record<UpdatePetInputKeys, UpdatePetInputValues>> = {}
  const photos: PetPhoto[] = []
  const parts = request.parts()

  for await (const part of parts) {
    if (part.type === 'file') {
      const buffer = await convertReadableToBuffer(part.file)

      photos.push({
        buffer,
        filename: part.filename,
        mimetype: part.mimetype,
      })
    } else {
      const fieldName = part.fieldname as UpdatePetInputKeys
      const value = part.value as UpdatePetInputValues
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
  } = updatePetBodySchema.parse({
    ...formData,
    adoptionRequirements: JSON.parse(formData.adoptionRequirements as string),
  })

  const updatePetUseCase = makeUpdatePetUseCase()

  try {
    await updatePetUseCase.execute({
      id: petId,
      name,
      description,
      ageInMonths,
      size,
      energyLevel,
      photos: parsedPhotos,
      adoptionRequirements,
      orgId,
    })

    return reply.status(204).send()
  } catch (error) {
    if (
      error instanceof ResourceNotFoundError ||
      error instanceof UploadPhotoError ||
      error instanceof RemovePhotoError
    ) {
      return reply.status(400).send({ message: error.message })
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message })
    }

    throw error
  }
}
