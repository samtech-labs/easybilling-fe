import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Invoice, CreateInvoiceRequest } from '@/types/invoice';

export const useGetInvoices = (companyId: string) => {
  return useQuery({
    queryKey: ['invoices', companyId],
    queryFn: async (): Promise<Invoice[]> => {
      const response = await apiClient.get<Invoice[]>(
        `/invoice/GetAllInvoices?companyId=${companyId}`
      );
      return response.data;
    },
    enabled: !!companyId,
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

export const useGenerateInvoicePdf = () => {
  return useMutation({
    mutationFn: async (invoiceId: string): Promise<Blob> => {
      const response = await apiClient.get(
        `/invoice/GeneratePdf?invoiceId=${invoiceId}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    },
  });
};
