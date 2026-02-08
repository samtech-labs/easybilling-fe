export interface MembershipTypeResponseDto {
  id: string;
  name: string;
  price: number;
  maxInvoicesPerMonth: number;
  eFacturaActive: boolean;
  durationInDays: number;
}

export interface CreateMembershipTypeRequest {
  name: string;
  price: number;
  maxInvoicesPerMonth: number;
  eFacturaActive: boolean;
  durationInDays: number;
}
