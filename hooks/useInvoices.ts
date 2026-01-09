import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Invoice, CreateInvoiceRequest, CreateCreditNoteRequest, LastInvoiceNumber, AnafSubmissionStatusDto } from '@/types/invoice';

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

export const useGetCreditNotes = (companyId: string) => {
  return useQuery({
    queryKey: ['creditNotes', companyId],
    queryFn: async (): Promise<Invoice[]> => {
      const response = await apiClient.get<Invoice[]>(
        `/invoice/GetAllCreditNotes?companyId=${companyId}`
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

export const useGetLastInvoiceNumber = (companyId: string | null) => {
  return useQuery({
    queryKey: ['lastInvoiceNumber', companyId],
    queryFn: async (): Promise<LastInvoiceNumber> => {
      const response = await apiClient.get<LastInvoiceNumber>(
        `/invoice/GetLastInvoiceNumber?companyId=${companyId}`
      );
      return response.data;
    },
    enabled: !!companyId,
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

export const useSendEfactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string): Promise<any> => {
      const response = await apiClient.post(
        `/invoice/SendEFactura?invoiceId=${invoiceId}`
      );
      return response.data;
    },
    onSuccess: (_, invoiceId) => {
      // Invalidate the status query to refetch the new status
      queryClient.invalidateQueries({ queryKey: ['anafSubmissionStatus', invoiceId] });
    },
  });
};

export const useGetAnafSubmissionStatus = (invoiceId: string | null) => {
  return useQuery({
    queryKey: ['anafSubmissionStatus', invoiceId],
    queryFn: async (): Promise<AnafSubmissionStatusDto> => {
      const response = await apiClient.get<AnafSubmissionStatusDto>(
        `/invoice/GetAnafSubmissionStatus?invoiceId=${invoiceId}`
      );
      return response.data;
    },
    enabled: !!invoiceId,
    refetchInterval: (query) => {
      const data = query.state.data as AnafSubmissionStatusDto | undefined;
      // Auto-refetch every 5 seconds if status is Pending or Processing
      if (data && (data.status === 0 || data.status === 1)) {
        return 5000;
      }
      return false;
    },
  });
};

export const useDownloadAnafResponse = () => {
  return useMutation({
    mutationFn: async (invoiceId: string): Promise<Blob> => {
      const response = await apiClient.get(
        `/invoice/DownloadAnafResponse?invoiceId=${invoiceId}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    },
  });
};

export const useCreateCreditNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCreditNoteRequest): Promise<Invoice> => {
      const response = await apiClient.post<Invoice>(
        '/invoice/CreateCreditNote',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['creditNotes'] });
    },
  });
};
