import { ChallengeStatus } from "./challenge.enum";

export interface Challenge {
    _id: string
    dataHoraDesafio: Date
    status: ChallengeStatus
    dataHoraSolicitacao: Date
    dataHoraResposta?: Date
    solicitante: string
    categoria: string
    partida?: string
    jogadores: string[]
    
}
