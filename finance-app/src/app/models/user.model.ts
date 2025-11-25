export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
  createdAt?: string;
  monthlyIncome?: number;
  salaryAutoAddEnabled?: boolean;
  salaryAutoAddDay?: number;
  lastSalaryAddDate?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}
