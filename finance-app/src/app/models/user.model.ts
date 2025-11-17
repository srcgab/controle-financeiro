export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  createdAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}
