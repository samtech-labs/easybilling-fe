export interface Company {
  id: string;
  name: string;
  address?: string;
  county?: string;
  city?: string;
  country?: string;
  regNumber?: string;
  cui: string;
  iban?: string;
  bank?: string;
  isVatPayer: boolean;
  isEFacturaActive: boolean;
  userId: string;
}
