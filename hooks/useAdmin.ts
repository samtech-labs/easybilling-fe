import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  UserResponseDto,
  CreateUserRequest,
  UpdateUserRequest,
  CreateCompanyForUserRequest,
  UserRole
} from '@/types/user';
import { Company } from '@/types/company';

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserResponseDto[]> => {
      const response = await apiClient.get<UserResponseDto[]>('/User/GetAllUsers');
      return response.data;
    },
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<UserResponseDto> => {
      const response = await apiClient.get<UserResponseDto>(
        `/User/GetUserById?userId=${userId}`
      );
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest): Promise<UserResponseDto> => {
      const response = await apiClient.post<UserResponseDto>('/User/CreateUser', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserRequest): Promise<UserResponseDto> => {
      const response = await apiClient.put<UserResponseDto>('/User/UpdateUser', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await apiClient.delete(`/User/DeleteUser?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useCreateCompanyForUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCompanyForUserRequest): Promise<Company> => {
      const response = await apiClient.post<Company>('/Company/CreateCompanyForUser', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useGetUserRoles = () => {
  return {
    roles: Object.values(UserRole),
    roleLabels: {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.USER]: 'User',
      [UserRole.ACCOUNTANT]: 'Accountant'
    }
  };
};
