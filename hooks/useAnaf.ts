import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface AnafAuthResponse {
  authUrl: string;
}

export interface AnafStatusResponse {
  isAuthorized: boolean;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}

export const useGetAnafStatus = () => {
  return useQuery({
    queryKey: ['anaf-status'],
    queryFn: async (): Promise<AnafStatusResponse> => {
      const response = await apiClient.get<AnafStatusResponse>('/anaf/status');
      return response.data;
    },
    retry: false,
  });
};

export const useGetAnafAuthUrl = () => {
  return useMutation({
    mutationFn: async (): Promise<AnafAuthResponse> => {
      const response = await apiClient.get<AnafAuthResponse>('/anaf/authorize');
      return response.data;
    },
  });
};
