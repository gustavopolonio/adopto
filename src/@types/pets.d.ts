export type EnergyLevel = 'MEDIUM' | 'LOW' | 'HIGH'

export type Size = 'MEDIUM' | 'SMALL' | 'LARGE'

interface PetPhoto {
  buffer: Buffer
  filename: string
  mimetype: string
}

export interface RegisterPetInput {
  name: string
  description: string
  ageInMonths: number
  size: Size
  energyLevel: EnergyLevel
  photos: PetPhoto[]
  adoptionRequirements: string[]
  orgId: string
}

export type RegisterPetInputKeys = keyof RegisterPetInput

export type RegisterPetInputValues = RegisterPetInput[keyof RegisterPetInput]

export interface UpdatePetInput {
  id: string
  name: string
  description: string
  ageInMonths: number
  size: Size
  energyLevel: EnergyLevel
  photos: PetPhoto[]
  adoptionRequirements: string[]
  orgId: string
}

export type UpdatePetInputKeys = keyof UpdatePetInput

export type UpdatePetInputValues = UpdatePetInput[keyof UpdatePetInput]
