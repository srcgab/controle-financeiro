export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}
