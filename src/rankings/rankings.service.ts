import { Injectable, Logger } from '@nestjs/common';
import { Match } from './interfaces/match.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ranking } from './interfaces/ranking.schema'
import { RpcException } from '@nestjs/microservices';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy'
import { Category } from './interfaces/category.interface';
import { RankingResponse, History } from './interfaces/ranking-response.interface'
import { EventStatus } from './interfaces/event.enum';
import { Challenge } from './interfaces/challenge.interface';
import * as _ from 'lodash'
import * as momentTimezone from 'moment-timezone'


@Injectable()
export class RankingsService {

  constructor(
    @InjectModel('Ranking') private readonly desafioModel: Model<Ranking>,
    private clientProxySmartRanking: ClientProxySmartRanking
  ) { }

  private readonly logger = new Logger(RankingsService.name)

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance()

  private clientChallenge =
    this.clientProxySmartRanking.getClientProxyChallengeInstance()

  async processMatch(idMatch: string, match: Match): Promise<void> {

    try {

      const category: Category = await this.clientAdminBackend.send('get-categories',
        match.category).toPromise()

      await Promise.all(match.players.map(async player => {

        const ranking = new this.desafioModel()

        ranking.category = match.category;
        ranking.challenge = match.challenge;
        ranking.match = idMatch;
        ranking.player = player;

        if (player == match.def) {

          const eventFilter = category.events.filter(
            event => event.name == EventStatus.VICTORY
          )

          ranking.event = EventStatus.VICTORY
          ranking.operation = eventFilter[0].operation
          ranking.points = eventFilter[0].value

        } else {

          const eventFilter = category.events.filter(
            event => event.name == EventStatus.DEFEAT
          )

          ranking.event = EventStatus.DEFEAT
          ranking.operation = eventFilter[0].operation
          ranking.points = eventFilter[0].value

        }

        this.logger.log(`ranking: ${JSON.stringify(ranking)}`)

        await ranking.save()

      }))

    } catch (error) {

      this.logger.error(`error: ${error}`)
      throw new RpcException(error.message)

    }

  }


  async getRankings(idCategory: any, dataRef: string): Promise<RankingResponse[] | RankingResponse> {

    try {

      this.logger.log(`idCategora: ${idCategory} dataRef: ${dataRef}`)

      if (!dataRef) {

        dataRef = momentTimezone().tz("America/Sao_Paulo").format('YYYY-MM-DD')
        this.logger.log(`dataRef: ${dataRef}`)

      }

      /*
          Recuperou os registros de partidas processadas, filtrando a categoria recebida
          na requisição.
      */
      const recordsRanking = await this.desafioModel.find()
        .where('category')
        .equals(idCategory)
        .exec()

      /*
          Agora vamos recuperar todos os desafios com data menor
          ou igual à data que recebemos na requisição.
          Somente iremos recuperar desafios que estiverem com o status igual 
          a 'REALIZADO' e filtrando a categoria.
      */

      const challenges: Challenge[] = await this.clientChallenge.send('get-challenges-realized',
        { idCategory: idCategory, dataRef: dataRef }).toPromise()

      /*
          Realizaremos um loop nos registros que recuperamos do ranking (partidas processadas)
          e descartaremos os registros (com base no id do desafio) que não retornaram no
          objeto desafios
      */

      _.remove(recordsRanking, function (item) {
        return challenges.filter(challenge => challenge._id == item.challenge).length == 0
      })

      this.logger.log(`recordsRanking: ${JSON.stringify(recordsRanking)}`)

      //Agrupar por jogador

      const resultado =
        _(recordsRanking)
          .groupBy('player')
          .map((items, key) => ({
            'player': key,
            'history': _.countBy(items, 'event'),
            'points': _.sumBy(items, 'points')
          }))
          .value()

      const resultSorted = _.orderBy(resultado, 'points', 'desc')

      this.logger.log(`resultSorted: ${JSON.stringify(resultSorted)}`)

      const rankingResponseList: RankingResponse[] = []

      resultSorted.map(function (item, index) {

        const rankingResponse: RankingResponse = {}

        rankingResponse.player = item.player
        rankingResponse.position = index + 1
        rankingResponse.points = item.points

        const history: History = {}

        history.victories = item.history.VICTORY ? item.history.VICTORY : 0
        history.defeats = item.history.DEFEAT ? item.history.DEFEAT : 0
        rankingResponse.matchHistory = history

        rankingResponseList.push(rankingResponse)

      })

      return rankingResponseList

    } catch (error) {

      this.logger.error(`error: ${JSON.stringify(error.message)}`)
      throw new RpcException(error.message)

    }

  }



}
