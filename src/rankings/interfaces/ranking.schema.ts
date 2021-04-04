import * as mongoose from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true, collection: 'rankings' })
export class Ranking extends mongoose.Document {

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  challenge: string

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  player: string

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  match: string

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  category: string

  @Prop()
  event: string

  @Prop()
  operation: string

  @Prop()
  points: number

}

export const RankingSchema = SchemaFactory.createForClass(Ranking)
