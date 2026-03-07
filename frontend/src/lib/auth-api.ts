import api from './api';
import { AuthResponse } from '@/types';

interface RegisterDto {
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await api.clientInstance.post<AuthResponse>('/auth/register', dto);
    api.setToken(data.token);
    return data;
  },

  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await api.clientInstance.post<AuthResponse>('/auth/login', dto);
    api.setToken(data.token);
    return data;
  },

  logout: () => {
    api.clearToken();
  },
};
