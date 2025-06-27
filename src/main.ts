import 'reflect-metadata'

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { findAvailablePort } from './common/helpers'

async function bootstrap() {
  const port = Number(process.env.PORT) || 3000
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  findAvailablePort(port).then(serverPort => {
    app.listen(serverPort, () => {
      Logger.log(`Server listening on: http://localhost:${serverPort}`, 'NestApplication')
    })
  })
}

bootstrap()
