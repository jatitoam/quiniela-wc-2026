import { useMutation } from '@tanstack/react-query';
import type { AuthResponseDto, LoginDto, RegisterDto } from '@quiniela/types';
import { api } from './client';
import { useAuth } from '../context/auth';

export function useLogin() {
  const { setAuth } = useAuth();
  return useMutation({
    mutationFn: (dto: LoginDto) => api.post<AuthResponseDto>('/auth/login', dto),
    onSuccess: (data) => setAuth(data.accessToken, data.user),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (dto: RegisterDto) => api.post<{ message: string }>('/auth/register', dto),
  });
}

export function useLogout() {
  const { clearAuth } = useAuth();
  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    onSuccess: clearAuth,
    onError: clearAuth,
  });
}
