import { EnergyLevel, Pet, Prisma, Size } from '@prisma/client'

export interface PetsRepository {
  findById(id: string): Promise<Pet | null>
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
  delete(id: string): Promise<void>
  deleteManyByOrgId(orgId: string): Promise<void>
}
