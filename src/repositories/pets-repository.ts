import { EnergyLevel, Pet, Prisma, Size } from '@prisma/client'

export interface PetsRepository {
  findById(
    id: string,
    includePhotos?: boolean,
    includeCoordinates?: boolean,
  ): Promise<Pet | null>
  findManyByCity(
    city: string,
    page: number,
    sortBy?: 'mostRecent',
    filters?: {
      ageInMonths?: {
        min: number
        max: number
      }
      size?: Size
      energyLevel?: EnergyLevel
    },
  ): Promise<Pet[]>
  create(data: Prisma.PetUncheckedCreateInput): Promise<Pet>
  save(pet: Pet): Promise<Pet>
  softDelete(id: string): Promise<void>
  softDeleteManyByOrgId(orgId: string): Promise<void>
}
