import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import fs from 'node:fs'
import { join } from 'path'
import { promisify } from 'util'

import { User } from '../auth/user/entities'
import { EmailSendingException } from '../common/helpers'

enum TEMPLATES {
  FORGOT_PASSWORD = './forgot-password',
  CHANGE_PASSWORD = './change-password',
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly mailerService: MailerService) {}

  async sendForgotPasswordEmail(code: string, jwt: string, user: User) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${jwt}`
    return this.sendEmail(
      user,
      'Restablecimiento de contraseña de Tienda Bigotes',
      TEMPLATES.FORGOT_PASSWORD,
      { code, url },
    )
  }

  async notifyPasswordChange(user: User) {
    return this.sendEmail(
      user,
      'Confirmación de cambio de contraseña de Tienda Bigotes',
      TEMPLATES.CHANGE_PASSWORD,
    )
  }

  private async sendEmail(
    { email, names }: User,
    subject: string,
    template: TEMPLATES,
    context: Record<string, any> = {},
  ) {
    const logoBuffer = await this.getBufferFromAsset('shop-logo.png')
    const logoBase64 = logoBuffer.toString('base64')

    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template,
        context: {
          names,
          email,
          ...context,
        },
        attachments: [
          {
            cid: 'shop-logo',
            content: Buffer.from(logoBase64, 'base64'),
            contentDisposition: 'inline',
            contentTransferEncoding: 'base64',
            contentType: 'image/png',
            encoding: 'base64',
            filename: 'shop-logo.png',
          },
        ],
      })
      this.logger.log(`${subject} email sent to ${email}`)
    } catch (error) {
      throw new EmailSendingException(
        `Failed to send ${subject} email to ${email} - ${error.message}`,
      )
    }
  }

  private async getBufferFromAsset(path: string): Promise<Buffer> {
    const readFileAsync = promisify(fs.readFile)
    return await readFileAsync(join(__dirname, `../../src/assets/${path}`))
  }
}
