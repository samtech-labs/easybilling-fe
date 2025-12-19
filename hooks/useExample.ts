import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// Example: Fetching data with authentication (GET request)
interface ExampleData {
  id: string;
  name: string;
}

export const useGetExampleData = () => {
  return useQuery({
    queryKey: ['exampleData'],
    queryFn: async (): Promise<ExampleData[]> => {
      const response = await apiClient.get<ExampleData[]>('/example');
      return response.data;
    },
  });
};

// Example: Creating data with authentication (POST request)
interface CreateExampleInput {
  name: string;
}

export const useCreateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExampleInput): Promise<ExampleData> => {
      const response = await apiClient.post<ExampleData>('/example', input);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['exampleData'] });
    },
  });
};

// Example: Updating data with authentication (PUT request)
interface UpdateExampleInput {
  id: string;
  name: string;
}

export const useUpdateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateExampleInput): Promise<ExampleData> => {
      const response = await apiClient.put<ExampleData>(`/example/${input.id}`, {
        name: input.name,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exampleData'] });
    },
  });
};

// Example: Deleting data with authentication (DELETE request)
export const useDeleteExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/example/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exampleData'] });
    },
  });
};
