import { Pet, Prisma } from '@prisma/client'

export interface PetsRepository {
  findById(id: string): Promise<Pet | null>
  create(data: Prisma.PetUncheckedCreateInput): Promise<Pet>
  save(pet: Pet): Promise<Pet>
  delete(id: string): Promise<void>
  deleteManyByOrgId(orgId: string): Promise<void>
}
