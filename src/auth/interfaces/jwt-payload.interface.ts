export interface JwtPayload {
  id: string
  names: string
  paternalSurname: string
  maternalSurname: string
  dni: string
  email?: string
  phoneNumber?: number
  active: boolean
  roles: string[]
}
