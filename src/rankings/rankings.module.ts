import { Module } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { RankingsController } from './rankings.controller';
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingSchema } from './interfaces/ranking.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Ranking', schema: RankingSchema }]), ProxyRMQModule],
    providers: [RankingsService],
    controllers: [RankingsController]
})
export class RankingsModule { }
