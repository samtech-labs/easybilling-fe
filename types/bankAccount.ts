import { Currency } from './invoice';

export interface BankAccount {
  id: string;
  companyId: string;
  bankName: string;
  iban: string;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountRequest {
  bankName: string;
  iban: string;
  currency: Currency;
}

export interface UpdateBankAccountRequest {
  bankName: string;
  iban: string;
  currency: Currency;
}

export const IBAN_REGEX = /^RO\d{2}[A-Z]{4}[A-Za-z0-9]{16}$/;
export const BANK_NAME_MAX = 100;
export const IBAN_MAX = 34;

export function formatIban(iban: string): string {
  const compact = iban.replace(/\s+/g, '').toUpperCase();
  return compact.replace(/(.{4})/g, '$1 ').trim();
}
