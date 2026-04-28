'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetClients, useDeleteClient } from '@/hooks/useClients';
import { Company } from '@/types/company';
import { Client } from '@/types/client';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CreateClientModal from './CreateClientModal';
import BankAccountsModal from './BankAccountsModal';

interface ClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

export default function ClientsModal({ isOpen, onClose, company }: ClientsModalProps) {
  const router = useRouter();
  const tClient = useTranslations('client');
  const tCompany = useTranslations('company');
  const tCommon = useTranslations('common');
  const tBank = useTranslations('bankAccount');
  const { data: clients, isLoading, error } = useGetClients(company?.id || null);
  const deleteClientMutation = useDeleteClient(company?.id || '');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBankAccountsModalOpen, setIsBankAccountsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleViewInvoices = () => {
    if (company) {
      router.push(`/invoices?companyId=${company.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClientMutation.mutateAsync(clientToDelete.id);
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 sm:p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{tCommon('clients')}</h3>
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
              onClick={handleViewInvoices}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-initial min-h-[44px]"
            >
              <svg className="w-5 h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">{tClient('viewInvoices')}</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex-1 sm:flex-initial min-h-[44px]"
            >
              <svg className="w-5 h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{tClient('newClient')}</span>
            </button>
            <button
              onClick={() => setIsBankAccountsModalOpen(true)}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex-1 sm:flex-initial min-h-[44px]"
            >
              <svg className="w-5 h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3" />
              </svg>
              <span className="hidden sm:inline">{tBank('bankAccounts')}</span>
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
            {tClient('errorLoadingClients')}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {clients && clients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{tClient('noClientsFound')}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tCompany('name')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tCompany('cui')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tCompany('address')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tCompany('county')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tCompany('regNumber')}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tCompany('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients?.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {client.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.cui}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.address || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.county || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.regNumber || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={(e) => handleDeleteClick(e, client)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title={tCommon('delete') + ' ' + tCommon('client').toLowerCase()}
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Hidden on desktop */}
                <div className="md:hidden space-y-3">
                  {clients?.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900">{client.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">CUI: {client.cui}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteClick(e, client)}
                          className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title={tCommon('delete') + ' ' + tCommon('client').toLowerCase()}
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
                      <div className="space-y-2 text-sm">
                        {client.address && (
                          <div className="flex">
                            <span className="text-gray-500 font-medium w-28">{tCompany('address')}:</span>
                            <span className="text-gray-900 flex-1">{client.address}</span>
                          </div>
                        )}
                        {client.county && (
                          <div className="flex">
                            <span className="text-gray-500 font-medium w-28">{tCompany('county')}:</span>
                            <span className="text-gray-900">{client.county}</span>
                          </div>
                        )}
                        {client.regNumber && (
                          <div className="flex">
                            <span className="text-gray-500 font-medium w-28">{tCompany('regNumber')}:</span>
                            <span className="text-gray-900">{client.regNumber}</span>
                          </div>
                        )}
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

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        companyId={company.id}
      />

      {/* Bank Accounts Modal */}
      <BankAccountsModal
        isOpen={isBankAccountsModalOpen}
        onClose={() => setIsBankAccountsModalOpen(false)}
        company={company}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={tCommon('delete') + ' ' + tCommon('client')}
        message={`${tCommon('delete')} "${clientToDelete?.name}"?`}
        isDeleting={deleteClientMutation.isPending}
      />
    </div>
  );
}
