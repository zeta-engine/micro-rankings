import { Injectable } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

@Injectable()
export class ClientProxySmartRanking {
  getClientProxyAdminBackendInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://user:user@0.0.0.0:5672'],
        queue: 'admin-backend',
      }
    });
  }

  getClientProxyChallengeInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://user:user@0.0.0.0:5672'],
        queue: 'challenges',
      }
    });
  }

  getClientProxyRankingsInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://user:user@0.0.0.0:5672'],
        queue: 'rankings',
      }
    });
  }
}