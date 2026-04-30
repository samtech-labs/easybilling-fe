export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number; // Legacy property
  vat?: number; // Legacy property
  vatRate?: number; // Backend property
  unit?: string; // Backend property
  lineTotal?: number; // Backend calculated property
  lineTotalWithVat?: number; // Backend calculated property
}

export const DEFAULT_UNIT = 'buc';

export const UNIT_OPTIONS = [
  { value: 'buc', label: 'buc (bucăți)' },
  { value: 'ore', label: 'ore (ore)' },
  { value: 'zile', label: 'zile (zile)' },
  { value: 'luni', label: 'luni (luni)' },
  { value: 'kg', label: 'kg (kilograme)' },
  { value: 'm', label: 'm (metri)' },
  { value: 'mp', label: 'mp (metri pătrați)' },
  { value: 'l', label: 'l (litri)' },
  { value: 'elem', label: 'elem (elemente)' },
  { value: 'set', label: 'set (seturi)' },
] as const;

export enum InvoiceType {
  Invoice = 380,
  CreditNote = 381,
}

export enum Currency {
  RON = 0,
  EUR = 1,
}

export const CurrencyLabel: Record<Currency, string> = {
  [Currency.RON]: 'RON',
  [Currency.EUR]: 'EUR',
};

export function getCurrencyLabel(currency?: Currency): string {
  return CurrencyLabel[currency ?? Currency.RON];
}

export interface Invoice {
  id: string;
  date: string;
  dueDate?: string;
  series: string;
  number: number;
  totalAmount: number;
  totalVat: number;
  grandTotal: number;
  type?: InvoiceType;
  currency?: Currency;
  originalInvoiceId?: string;
  originalInvoiceNumber?: string;
  bankAccountId?: string | null;
  bankAccountBankName?: string | null;
  bankAccountIban?: string | null;
  company: {
    id: string;
    name: string;
    cui: string;
    address?: string;
    county?: string;
    regNumber?: string;
  };
  client: {
    id?: string;
    name: string;
    cui: string;
    address?: string;
    county?: string;
    regNumber?: string;
  };
  invoiceLines: InvoiceLine[];
}

export interface LastInvoiceNumber {
  series: string;
  number: number;
}

export interface CreateInvoiceRequest {
  currency?: Currency;
  companyId: string;
  clientId?: string;
  clientDetails?: {
    name: string;
    cui: string;
    address?: string;
    county?: string;
    regNumber?: string;
    iban?: string;
    bank?: string;
  };
  series: string;
  number: number;
  issueDate: string;
  dueDate: string;
  invoiceLines: InvoiceLine[];
  notes?: string;
  bankAccountId?: string | null;
}

export enum AnafSubmissionStatus {
  Pending = 0,
  Processing = 1,
  Ok = 2,
  Error = 3,
}

export interface AnafSubmissionStatusDto {
  id?: string;
  status: AnafSubmissionStatus;
  errorMessage?: string;
  uploadedAt?: string;
  lastCheckedAt?: string;
  downloadId?: string;
}

export interface CreateCreditNoteRequest {
  originalInvoiceId: string;
  series?: string;
  number?: string;
  lines?: InvoiceLine[];
  bankAccountId?: string | null;
}
