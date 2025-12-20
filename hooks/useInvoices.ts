import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Invoice, CreateInvoiceRequest } from '@/types/invoice';

export const useGetInvoices = (companyId?: string) => {
  return useQuery({
    queryKey: ['invoices', companyId],
    queryFn: async (): Promise<Invoice[]> => {
      const url = companyId
        ? `/invoice/GetAllInvoices?companyId=${companyId}`
        : '/invoice/GetAllInvoices';
      const response = await apiClient.get<Invoice[]>(url);
      return response.data;
    },
  });
};

export const useGetInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async (): Promise<Invoice> => {
      const response = await apiClient.get<Invoice>(
        `/invoice/GetInvoice?invoiceId=${invoiceId}`
      );
      return response.data;
    },
    enabled: !!invoiceId,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceRequest): Promise<Invoice> => {
      const response = await apiClient.post<Invoice>(
        '/invoice/CreateInvoice',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string): Promise<void> => {
      await apiClient.delete(`/invoice/DeleteInvoice?invoiceId=${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
