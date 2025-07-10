import { BaseUserDto } from '../dto'
import { capitalizeEachWord } from '../../../common/helpers'

const reniecApisnet = async (dni: string): Promise<BaseUserDto> => {
  try {
    const url = `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.APISNET_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`Error HTTP ${response.status} de apis.net.pe: ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (data && data.nombres) {
      return {
        dni: data.numeroDocumento,
        names: capitalizeEachWord(data.nombres),
        paternalSurname: capitalizeEachWord(data.apellidoPaterno),
        maternalSurname: capitalizeEachWord(data.apellidoMaterno),
      }
    } else {
      if (data.message) {
        console.log(`API informó un error para el DNI ${dni}: ${data.message}`)
      }
      return null
    }
  } catch (error) {
    console.error('Error fetching DNI data:', error)
  }
}

export { reniecApisnet }
