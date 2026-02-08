export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  role: string;
}

export interface UpdateUserRequest {
  id: string;
  username?: string;
  password?: string;
  email?: string;
  role?: string;
}

export interface CreateCompanyForUserRequest {
  userId: string;
  name: string;
  cui: string;
  address?: string;
  county?: string;
  city?: string;
  country?: string;
  regNumber?: string;
  iban?: string;
  bank?: string;
  isVatPayer?: boolean;
  isEFacturaActive?: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ACCOUNTANT = 'ACCOUNTANT'
}
