import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export interface ProfileEntity {
  profile_id: number;
  name: string;
  dob: string;
  email: string;
  uuid: string;
  password: string;
}

export class ProfilePayload {
  @IsDefined({ message: 'name cannot be missing' })
  @IsNotEmpty({ message: 'name cannot be empty' })
  @IsString({ message: 'name has to be a string' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name: string;

  @IsDefined({ message: 'date of birth cannot be missing' })
  @IsNotEmpty({ message: 'date of birth cannot be empty' })
  @IsString({ message: 'date of birth has to be a string' })
  @MaxLength(30, { message: 'date of birth must be at most 30 characters' })
  dob: string;
}
