export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vat: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
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
  invoiceLines: InvoiceLine[];
  subtotal: number;
  totalVat: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
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
  issueDate: string;
  dueDate: string;
  invoiceLines: InvoiceLine[];
  notes?: string;
}
