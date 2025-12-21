export interface Client {
  id: string;
  companyId: string;
  name: string;
  address?: string;
  county?: string;
  cui: string;
  regNumber?: string;
  iban?: string;
  bank?: string;
}
