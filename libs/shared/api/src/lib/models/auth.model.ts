import { User } from './user.model';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  userId: string;
  email: string;
}
