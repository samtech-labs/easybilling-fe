import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Company } from '@/types/company';

export const useGetCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      const response = await apiClient.get<Company[]>('/company/GetAllCompanies');
      return response.data;
    },
  });
};
