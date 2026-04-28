'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  useCreateBankAccount,
  useUpdateBankAccount,
} from '@/hooks/useBankAccounts';
import {
  BankAccount,
  CreateBankAccountRequest,
  IBAN_REGEX,
  BANK_NAME_MAX,
  IBAN_MAX,
} from '@/types/bankAccount';
import { Currency } from '@/types/invoice';

interface CreateBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  bankAccount?: BankAccount | null;
}

export default function CreateBankAccountModal({
  isOpen,
  onClose,
  companyId,
  bankAccount,
}: CreateBankAccountModalProps) {
  const tBank = useTranslations('bankAccount');
  const tCommon = useTranslations('common');

  const isEditMode = !!bankAccount;

  const [formData, setFormData] = useState<CreateBankAccountRequest>({
    bankName: '',
    iban: '',
    currency: Currency.RON,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createMutation = useCreateBankAccount(companyId);
  const updateMutation = useUpdateBankAccount(companyId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      if (bankAccount) {
        setFormData({
          bankName: bankAccount.bankName,
          iban: bankAccount.iban,
          currency: bankAccount.currency,
        });
      } else {
        setFormData({ bankName: '', iban: '', currency: Currency.RON });
      }
    }
  }, [isOpen, bankAccount]);

  const handleBankNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, bankName: e.target.value }));
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '').toUpperCase();
    setFormData((prev) => ({ ...prev, iban: value }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      currency: Number(e.target.value) as Currency,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const bankName = formData.bankName.trim();
    const iban = formData.iban.trim();

    if (!bankName) {
      setErrorMessage(tBank('bankNameRequired'));
      return;
    }
    if (bankName.length > BANK_NAME_MAX) {
      setErrorMessage(tBank('bankNameTooLong'));
      return;
    }
    if (!iban) {
      setErrorMessage(tBank('ibanRequired'));
      return;
    }
    if (iban.length > IBAN_MAX) {
      setErrorMessage(tBank('ibanTooLong'));
      return;
    }
    if (!IBAN_REGEX.test(iban)) {
      setErrorMessage(tBank('ibanInvalid'));
      return;
    }

    const payload: CreateBankAccountRequest = {
      bankName,
      iban,
      currency: formData.currency,
    };

    try {
      if (isEditMode && bankAccount) {
        await updateMutation.mutateAsync({ id: bankAccount.id, data: payload });
        setSuccessMessage(tBank('bankAccountUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        setSuccessMessage(tBank('bankAccountCreatedSuccess'));
      }

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    } catch (error: unknown) {
      const fallback = isEditMode
        ? tBank('bankAccountUpdatedError')
        : tBank('bankAccountCreatedError');
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || fallback;
      setErrorMessage(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-20 mx-auto p-4 sm:p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditMode ? tBank('editBankAccount') : tBank('createBankAccount')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="bankName"
              className="block text-sm font-medium text-gray-700"
            >
              {tBank('bankName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              required
              maxLength={BANK_NAME_MAX}
              value={formData.bankName}
              onChange={handleBankNameChange}
              placeholder={tBank('bankNamePlaceholder')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="iban"
              className="block text-sm font-medium text-gray-700"
            >
              {tBank('iban')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="iban"
              name="iban"
              required
              maxLength={IBAN_MAX}
              value={formData.iban}
              onChange={handleIbanChange}
              placeholder={tBank('ibanPlaceholder')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono uppercase"
              autoCapitalize="characters"
              spellCheck={false}
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700"
            >
              {tBank('currency')} <span className="text-red-500">*</span>
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleCurrencyChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value={Currency.RON}>RON</option>
              <option value={Currency.EUR}>EUR</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? tCommon('loading') + '...'
                : isEditMode
                ? tCommon('save')
                : tBank('createBankAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
