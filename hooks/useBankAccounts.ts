import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  BankAccount,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
} from '@/types/bankAccount';

export const useGetBankAccounts = (companyId: string | null) => {
  return useQuery({
    queryKey: ['bankAccounts', companyId],
    queryFn: async (): Promise<BankAccount[]> => {
      if (!companyId) return [];
      const response = await apiClient.get<BankAccount[]>(
        `/bank-accounts?companyId=${companyId}`
      );
      return response.data;
    },
    enabled: !!companyId,
  });
};

export const useGetBankAccount = (id: string | null, companyId: string | null) => {
  return useQuery({
    queryKey: ['bankAccount', id],
    queryFn: async (): Promise<BankAccount | null> => {
      if (!id || !companyId) return null;
      const response = await apiClient.get<BankAccount>(
        `/bank-accounts/${id}?companyId=${companyId}`
      );
      return response.data;
    },
    enabled: !!id && !!companyId,
  });
};

export const useCreateBankAccount = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBankAccountRequest): Promise<BankAccount> => {
      const response = await apiClient.post<BankAccount>(
        `/bank-accounts?companyId=${companyId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts', companyId] });
    },
  });
};

export const useUpdateBankAccount = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBankAccountRequest;
    }): Promise<BankAccount> => {
      const response = await apiClient.put<BankAccount>(
        `/bank-accounts/${id}?companyId=${companyId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts', companyId] });
      queryClient.invalidateQueries({ queryKey: ['bankAccount', variables.id] });
    },
  });
};

export const useDeleteBankAccount = (companyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/bank-accounts/${id}?companyId=${companyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts', companyId] });
    },
  });
};
