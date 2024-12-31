export interface RegisterOrgInput {
  name: string
  email: string
  password: string
  zipCode: string
  address: string
  city: string
  whatsapp: string
}

export interface AuthenticateOrgInput {
  email: string
  password: string
}
