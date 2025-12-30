import { IsDefined, IsMongoId, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsDefined()
  @IsMongoId()
  trainingId!: string;

}
