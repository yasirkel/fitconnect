import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TrainingDocument = HydratedDocument<Training>;

// Defineer het mongodb schema voor trainingen, en stel de toJSON transformatie in voor id haalt underscore weg
@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})

// Training class representeerd een training 
export class Training {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  startTime!: string; 

  @Prop({ required: true, min: 1 })
  durationMinutes!: number;

  @Prop({ required: true, min: 1 })
  capacity!: number;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
