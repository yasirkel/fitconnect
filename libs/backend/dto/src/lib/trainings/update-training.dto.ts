import { IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTrainingDto {
  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
