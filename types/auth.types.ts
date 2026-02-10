// TypeScript types for User and Authentication

export type UserRole = 'nutritionist' | 'client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phone: string;
  role: UserRole;
}
