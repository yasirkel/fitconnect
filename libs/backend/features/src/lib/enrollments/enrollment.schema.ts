import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
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
export class Enrollment {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  trainingId!: Types.ObjectId;

  @Prop({ required: true })
  userId!: string;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Zorgt ervoor dat een user maar een keer per training kan inschrijven
EnrollmentSchema.index({ trainingId: 1, userId: 1 }, { unique: true });
