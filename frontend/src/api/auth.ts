import client from './client';
import type { User, AuthTokens } from '../types';

export async function login(email: string, password: string): Promise<AuthTokens> {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const res = await client.post<AuthTokens>('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await client.get<User>('/users/me');
  return res.data;
}
