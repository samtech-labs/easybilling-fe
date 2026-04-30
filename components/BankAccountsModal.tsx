'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useGetBankAccounts,
  useDeleteBankAccount,
} from '@/hooks/useBankAccounts';
import { BankAccount, formatIban } from '@/types/bankAccount';
import { Company } from '@/types/company';
import { getCurrencyLabel } from '@/types/invoice';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CreateBankAccountModal from './CreateBankAccountModal';

interface BankAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

export default function BankAccountsModal({
  isOpen,
  onClose,
  company,
}: BankAccountsModalProps) {
  const tBank = useTranslations('bankAccount');
  const tCommon = useTranslations('common');

  const { data: bankAccounts, isLoading, error } = useGetBankAccounts(
    company?.id || null
  );
  const deleteMutation = useDeleteBankAccount(company?.id || '');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(
    null
  );

  const openCreate = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAccount(null);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteMutation.mutateAsync(accountToDelete.id);
      setAccountToDelete(null);
    } catch (err) {
      console.error('Failed to delete bank account:', err);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 sm:p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {tBank('bankAccounts')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{company.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              &times;
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex-1 sm:flex-initial min-h-[44px]"
            >
              <svg
                className="w-5 h-5 sm:mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">{tBank('addBankAccount')}</span>
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {tBank('errorLoadingBankAccounts')}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {bankAccounts && bankAccounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">{tBank('noBankAccountsFound')}</p>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md min-h-[44px]"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {tBank('addFirstBankAccount')}
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tBank('bankName')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tBank('iban')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tBank('currency')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tCommon('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bankAccounts?.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {account.bankName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                            {formatIban(account.iban)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {getCurrencyLabel(account.currency)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="inline-flex items-center gap-3">
                              <button
                                onClick={() => openEdit(account)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                title={tCommon('edit')}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => setAccountToDelete(account)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title={tCommon('delete')}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {bankAccounts?.map((account) => (
                    <div
                      key={account.id}
                      className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900">
                            {account.bankName}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                            {getCurrencyLabel(account.currency)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => openEdit(account)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={tCommon('edit')}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setAccountToDelete(account)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={tCommon('delete')}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 font-mono break-all">
                        {formatIban(account.iban)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]"
          >
            {tCommon('close')}
          </button>
        </div>
      </div>

      <CreateBankAccountModal
        isOpen={isFormOpen}
        onClose={closeForm}
        companyId={company.id}
        bankAccount={editingAccount}
      />

      <DeleteConfirmationModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={tBank('deleteBankAccount')}
        message={
          accountToDelete
            ? tBank('deleteConfirm', {
                bankName: accountToDelete.bankName,
                iban: formatIban(accountToDelete.iban),
              })
            : ''
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
