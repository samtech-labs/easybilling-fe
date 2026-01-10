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
import {
  MembershipTypeResponseDto,
  CreateMembershipTypeRequest
} from '@/types/membershipType';
import {
  MembershipResponseDto,
  AssignMembershipRequest
} from '@/types/membership';

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

export const useGetCompaniesForUser = (userId: string) => {
  return useQuery({
    queryKey: ['companies-for-user', userId],
    queryFn: async (): Promise<Company[]> => {
      const response = await apiClient.get<Company[]>(
        `/Company/GetCompaniesForUser?userId=${userId}`
      );
      return response.data;
    },
    enabled: !!userId,
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
      queryClient.invalidateQueries({ queryKey: ['companies-for-user'] });
    },
  });
};

export const useDeleteCompanyForUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: string; userId: string }): Promise<void> => {
      await apiClient.delete(`/Company/DeleteCompanyForUser?companyId=${companyId}&userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies-for-user'] });
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

// Membership Type Hooks
export const useGetMembershipTypes = () => {
  return useQuery({
    queryKey: ['membershipTypes'],
    queryFn: async (): Promise<MembershipTypeResponseDto[]> => {
      const response = await apiClient.get<MembershipTypeResponseDto[]>('/MembershipType/GetAll');
      return response.data;
    },
  });
};

export const useGetMembershipTypeById = (id: string) => {
  return useQuery({
    queryKey: ['membershipType', id],
    queryFn: async (): Promise<MembershipTypeResponseDto> => {
      const response = await apiClient.get<MembershipTypeResponseDto>(
        `/MembershipType/GetById?id=${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateMembershipType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMembershipTypeRequest): Promise<MembershipTypeResponseDto> => {
      const response = await apiClient.post<MembershipTypeResponseDto>('/MembershipType/Create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipTypes'] });
    },
  });
};

export const useDeleteMembershipType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/MembershipType/Delete?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipTypes'] });
    },
  });
};

// Membership Hooks
export const useGetMemberships = () => {
  return useQuery({
    queryKey: ['memberships'],
    queryFn: async (): Promise<MembershipResponseDto[]> => {
      const response = await apiClient.get<MembershipResponseDto[]>('/Membership/GetAll');
      return response.data;
    },
  });
};

export const useGetMembershipsByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['memberships', 'user', userId],
    queryFn: async (): Promise<MembershipResponseDto[]> => {
      const response = await apiClient.get<MembershipResponseDto[]>(
        `/Membership/GetByUserId?userId=${userId}`
      );
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useGetActiveMembershipByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['memberships', 'active', userId],
    queryFn: async (): Promise<MembershipResponseDto> => {
      const response = await apiClient.get<MembershipResponseDto>(
        `/Membership/GetActiveMembershipByUserId?userId=${userId}`
      );
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useAssignMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignMembershipRequest): Promise<MembershipResponseDto> => {
      const response = await apiClient.post<MembershipResponseDto>('/Membership/Assign', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
  });
};

export const useDeleteMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/Membership/Delete?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
  });
};
