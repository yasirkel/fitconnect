import { IsDefined, IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class CreateTrainingDto {
  @IsDefined()
  @IsMongoId()
  clubId!: string;

  @IsDefined()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDefined()
  @IsString()
  startTime!: string;

  @IsDefined()
  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsDefined()
  @IsInt()
  @Min(1)
  capacity!: number;
}
