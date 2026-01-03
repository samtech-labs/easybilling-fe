export interface Client {
  id: string;
  companyId: string;
  name: string;
  address?: string;
  county?: string;
  city?: string;
  country?: string;
  cui: string;
  regNumber?: string;
  iban?: string;
  bank?: string;
}
