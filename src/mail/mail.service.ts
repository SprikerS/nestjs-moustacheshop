import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import fs from 'node:fs'
import { join } from 'path'
import { promisify } from 'util'

import { ForgotPasswordMailDto } from './dto'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly mailerService: MailerService) {}

  async sendForgotPassword({ email, names, code, url }: ForgotPasswordMailDto) {
    const logoBuffer = await this.getBufferFromAsset('shop-logo.png')

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Restablecimiento de contraseña de Tienda Bigotes',
        template: './forgot-password',
        context: {
          names,
          email,
          code,
          url,
        },
        attachments: [
          {
            filename: 'shop-logo.png',
            content: logoBuffer,
            encoding: 'base64',
            cid: 'shop-logo',
          },
        ],
      })
      this.logger.log(`Forgot password email sent to ${email}`)
    } catch (error) {
      this.logger.error(
        `Failed to send Forgot password email to ${email} - ${error.message}`,
      )
    }
  }

  private async getBufferFromAsset(path: string): Promise<Buffer> {
    const readFileAsync = promisify(fs.readFile)
    return await readFileAsync(join(__dirname, `../../src/assets/${path}`))
  }
}
