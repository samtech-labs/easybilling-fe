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

export interface Invoice {
  id: string;
  date: string;
  dueDate?: string;
  series: string;
  number: number;
  totalAmount: number;
  totalVat: number;
  grandTotal: number;
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
}
