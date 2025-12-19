import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Company } from '@/types/company';

export interface CreateCompanyRequest {
  name: string;
  cui: string;
  address?: string;
  county?: string;
  regNumber?: string;
  iban?: string;
  bank?: string;
}

export interface AnafCompanyData {
  id?: string;
  name: string;
  cui: string;
  address?: string;
  county?: string;
  regNumber?: string;
  iban?: string;
  bank?: string;
}

export const useGetCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      const response = await apiClient.get<Company[]>('/company/GetAllCompanies');
      return response.data;
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyRequest): Promise<Company> => {
      const response = await apiClient.post<Company>('/company/CreateCompany', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useGetAnafCompanyDetails = () => {
  return useMutation({
    mutationFn: async (cui: string): Promise<AnafCompanyData> => {
      const response = await apiClient.get<AnafCompanyData>(
        `/company/GetCompanyDetailsFromAnaf?cui=${encodeURIComponent(cui)}`
      );
      return response.data;
    },
  });
};
