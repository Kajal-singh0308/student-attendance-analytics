export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
