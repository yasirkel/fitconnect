import { IsDefined, IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsDefined()
  @IsEmail()
  email!: string;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password!: string;

  @IsDefined()
  @IsString()
  @MinLength(2)
  displayName!: string;
}
