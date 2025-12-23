import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ClubDocument extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true })
  city!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: [String] })
  sportsOffered!: string[];

  @Prop({ required: true })
  ownerId!: string;
}

export const ClubSchema = SchemaFactory.createForClass(ClubDocument);
