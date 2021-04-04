import { Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://user:user@0.0.0.0:5672'],
      noAck: false,
      queue: 'rankings',
    },
  });

  await app.listen(() => logger.log('Microservice is listening'));
}
bootstrap();
