import {
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDefined,
} from 'class-validator';

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsDefined()
  sportsOffered!: string[];

  @IsString()
  @IsNotEmpty()
  ownerId!: string;
}
