import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { LoginCredentials, AuthResponse } from '@/types/auth';

interface UseLoginOptions {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: Error) => void;
}

export const useLogin = (options?: UseLoginOptions) => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/token', credentials);
      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
