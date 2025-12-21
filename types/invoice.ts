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
  date: string;
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
