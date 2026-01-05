import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Client } from '@/types/client';
import { AnafCompanyData } from './useCompanies';

export interface CreateClientRequest {
  name: string;
  cui: string;
  address?: string;
  county?: string;
  city?: string;
  country?: string;
  regNumber?: string;
  iban?: string;
  bank?: string;
}

export interface AnafClientData {
  id?: string;
  name: string;
  cui: string;
  address?: string;
  county?: string;
  city?: string;
  country?: string;
  regNumber?: string;
  iban?: string;
  bank?: string;
}

export const useGetClients = (companyId: string | null) => {
  return useQuery({
    queryKey: ['clients', companyId],
    queryFn: async (): Promise<Client[]> => {
      if (!companyId) return [];
      const response = await apiClient.get<Client[]>(
        `/client/GetAllClients?companyId=${companyId}`
      );
      return response.data;
    },
    enabled: !!companyId, // Only fetch when companyId is provided
  });
};

export const useCreateClient = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientRequest): Promise<Client> => {
      const response = await apiClient.post<Client>(
        `/client/CreateClient?companyId=${companyId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', companyId] });
    },
  });
};

export const useGetAnafClientDetails = () => {
  return useMutation({
    mutationFn: async (cui: string): Promise<AnafCompanyData> => {
      const response = await apiClient.get<AnafCompanyData>(
        `/company/GetCompanyDetailsFromAnaf?cui=${encodeURIComponent(cui)}`
      );
      return response.data;
    },
  });
};

export const useDeleteClient = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string): Promise<void> => {
      await apiClient.delete(
        `/client/DeleteClient?clientId=${clientId}&companyId=${companyId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', companyId] });
    },
  });
};
