export interface MembershipResponseDto {
  id: string;
  userId: string;
  username: string;
  membershipTypeId: string;
  membershipTypeName: string;
  price: number;
  maxInvoicesPerMonth: number;
  eFacturaActive: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AssignMembershipRequest {
  userId: string;
  membershipTypeId: string;
  startDate: string;
}
