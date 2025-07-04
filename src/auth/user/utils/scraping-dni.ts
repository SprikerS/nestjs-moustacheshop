import * as cheerio from 'cheerio'

import FetchCookie from 'fetch-cookie'
import fetch from 'node-fetch-commonjs'
import { CookieJar } from 'tough-cookie'

import { BaseUserDto } from '../dto'
import { capitalizeEachWord } from '../../../common/helpers'

const cookieJar = new CookieJar()
const fetchWithCookies = FetchCookie(fetch, cookieJar)

const scrapingDNI = async (dni: string): Promise<BaseUserDto> => {
  try {
    const response = await fetchWithCookies('https://eldni.com')
    const html = await response.text()

    const $ = cheerio.load(html)
    const token = $('input[name="_token"]').val() as string

    // Second request
    const boundary = '----WebKitFormBoundaryKo3C2BgWCJ7bIT2w'
    const data = `--${boundary}
Content-Disposition: form-data; name="_token"

${token}
--${boundary}
Content-Disposition: form-data; name="dni"

${dni}
--${boundary}--`

    const headers = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    }

    const responsePost = await fetchWithCookies('https://eldni.com/pe/buscar-datos-por-dni', {
      method: 'POST',
      headers,
      body: data,
    })
    const htmlPost = await responsePost.text()

    const $post = cheerio.load(htmlPost)
    const divCopy = $post('div#div-copy')

    const names = divCopy.find('input#nombres').val() as string
    const paternalSurname = divCopy.find('input#apellidop').val() as string
    const maternalSurname = divCopy.find('input#apellidom').val() as string

    if (!names || !paternalSurname || !maternalSurname) {
      return null
    }

    return {
      dni,
      names: capitalizeEachWord(names),
      paternalSurname: capitalizeEachWord(paternalSurname),
      maternalSurname: capitalizeEachWord(maternalSurname),
    }
  } catch (error) {
    console.log(error)
  }
}

export { scrapingDNI }
