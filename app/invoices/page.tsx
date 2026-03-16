'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetInvoices, useGetCreditNotes, useGenerateInvoicePdf } from '@/hooks/useInvoices';
import { useGetCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice, InvoiceType, getCurrencyLabel } from '@/types/invoice';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';
import AnafIntegration from '@/components/AnafIntegration';
import InvoiceDetailsModal from '@/components/InvoiceDetailsModal';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import CreateCreditNoteModal from '@/components/CreateCreditNoteModal';
import DownloadInvoiceNameDialog from '@/components/DownloadInvoiceNameDialog';

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || '';
  const invoiceId = searchParams.get('invoiceId');
  const { isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const tInvoice = useTranslations('invoice');
  const tAnaf = useTranslations('anaf');
  const tCommon = useTranslations('common');
  const { data: companies } = useGetCompanies();
  const { data: invoices, isLoading: isLoadingInvoices, error: invoicesError } = useGetInvoices(companyId);
  const { data: creditNotes, isLoading: isLoadingCreditNotes, error: creditNotesError } = useGetCreditNotes(companyId);
  const generatePdfMutation = useGenerateInvoicePdf();

  const isLoading = isLoadingInvoices || isLoadingCreditNotes;
  const error = invoicesError || creditNotesError;
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isCreateCreditNoteModalOpen, setIsCreateCreditNoteModalOpen] = useState(false);
  const [creditNoteSourceInvoice, setCreditNoteSourceInvoice] = useState<Invoice | null>(null);
  const [showDownloadNameDialog, setShowDownloadNameDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{ blob: Blob; invoice: Invoice } | null>(null);

  const company = companies?.find((c) => c.id === companyId);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadPdfClick = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation(); // Prevent row click event
    setDownloadingInvoiceId(invoice.id);
    try {
      const pdfBlob = await generatePdfMutation.mutateAsync(invoice.id);
      setPendingDownload({ blob: pdfBlob, invoice });
      setShowDownloadNameDialog(true);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setDownloadingInvoiceId(null);
    }
  };

  const handleConfirmDownload = (customName: string) => {
    if (!pendingDownload) return;

    try {
      // Create a download link
      const url = window.URL.createObjectURL(pendingDownload.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setPendingDownload(null);
      setDownloadingInvoiceId(null);
    }
  };

  const handleCancelDownload = () => {
    setPendingDownload(null);
    setDownloadingInvoiceId(null);
  };

  const handleCreateCreditNote = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation(); // Prevent row click event
    setCreditNoteSourceInvoice(invoice);
    setIsCreateCreditNoteModalOpen(true);
  };

  const handleCreditNoteCreated = (creditNote: Invoice) => {
    showToast(tInvoice('creditNoteCreatedSuccess'), 'success');
    setIsCreateCreditNoteModalOpen(false);
    setCreditNoteSourceInvoice(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!companyId) {
      router.push('/companies');
    }
  }, [companyId, router]);

  // Auto-open invoice modal when invoiceId is in URL
  useEffect(() => {
    if (invoiceId && (invoices || creditNotes) && !isLoading) {
      const invoice = invoices?.find((inv) => inv.id === invoiceId) ||
                      creditNotes?.find((cn) => cn.id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setIsInvoiceModalOpen(true);
        // Remove invoiceId from URL after opening modal
        const newUrl = `/invoices?companyId=${companyId}`;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [invoiceId, invoices, creditNotes, isLoading, companyId, router]);

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  if (!companyId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tInvoice('loadingInvoices')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{tInvoice('errorLoadingInvoices')}</p>
          <button
            onClick={() => router.push('/companies')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            {tCommon('back')}
          </button>
        </div>
      </div>
    );
  }

  // Sort invoices and credit notes (already filtered from backend)
  const regularInvoices = [...(invoices || [])].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const sortedCreditNotes = [...(creditNotes || [])].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{tCommon('invoices')}</h1>
              {company && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{company.name}</span>
                  <span className="hidden sm:inline"> - {company.cui}</span>
                  <span className="block sm:hidden text-xs">{tInvoice('cui')}: {company.cui}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setIsCreateInvoiceModalOpen(true)}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto min-h-[44px]"
            >
              <svg className="w-5 h-5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{tInvoice('createInvoice')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ANAF Integration Section */}
        <div className="mb-6 bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{tInvoice('efacturaIntegration')}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {tInvoice('connectDigitalCertificate')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <AnafIntegration
                onSuccess={(message) => showToast(message, 'success')}
                onError={(message) => showToast(message, 'error')}
              />
            </div>
          </div>
        </div>

        {regularInvoices.length === 0 && sortedCreditNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600">{tInvoice('noInvoicesFound')}</p>
            <button
              onClick={() => router.push('/companies')}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              {tInvoice('createInvoice')}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block bg-white shadow overflow-x-auto sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tInvoice('invoiceNumber')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tInvoice('client')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tInvoice('issueDate')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tInvoice('totalAmount')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tInvoice('vat')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tInvoice('grandTotal')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {tCommon('view')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regularInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => handleInvoiceClick(invoice)}
                      className="hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.series} {invoice.number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{invoice.client.name}</div>
                        <div className="text-gray-500 text-xs">{tInvoice('cui')}: {invoice.client.cui}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {invoice.totalAmount.toFixed(2)} {getCurrencyLabel(invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {invoice.totalVat.toFixed(2)} {getCurrencyLabel(invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {invoice.grandTotal.toFixed(2)} {getCurrencyLabel(invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={(e) => handleDownloadPdfClick(e, invoice)}
                            disabled={downloadingInvoiceId === invoice.id}
                            className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title={tInvoice('downloadPdf')}
                          >
                          {downloadingInvoiceId === invoice.id ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              {tInvoice('generating')}
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              {tInvoice('downloadPdf')}
                            </>
                          )}
                        </button>

                        {/* Credit Note Button */}
                        <button
                          onClick={(e) => handleCreateCreditNote(e, invoice)}
                          className="inline-flex items-center px-3 py-1 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                          title={tInvoice('creditNote')}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {tInvoice('creditNote')}
                        </button>
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Hidden on desktop */}
            <div className="md:hidden space-y-4">
              {regularInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => handleInvoiceClick(invoice)}
                  className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-md active:bg-indigo-50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {invoice.series} {invoice.number}
                      </h3>
                      <p className="text-sm text-gray-900 font-medium mt-1">{invoice.client.name}</p>
                      <p className="text-xs text-gray-500">{tInvoice('cui')}: {invoice.client.cui}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{tInvoice('grandTotal')}</p>
                      <p className="text-lg font-bold text-indigo-600">{invoice.grandTotal.toFixed(2)} {getCurrencyLabel(invoice.currency)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">{tInvoice('issueDate')}</p>
                      <p className="font-medium text-gray-900">{formatDate(invoice.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{tInvoice('totalAmount')}</p>
                      <p className="font-medium text-gray-900">{invoice.totalAmount.toFixed(2)} {getCurrencyLabel(invoice.currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{tInvoice('vat')}</p>
                      <p className="font-medium text-gray-900">{invoice.totalVat.toFixed(2)} {getCurrencyLabel(invoice.currency)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={(e) => handleDownloadPdfClick(e, invoice)}
                      disabled={downloadingInvoiceId === invoice.id}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                    >
                      {downloadingInvoiceId === invoice.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {tInvoice('generatingPdf')}
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {tInvoice('downloadPdf')}
                        </>
                      )}
                    </button>

                    {/* Credit Note Button (Mobile) */}
                    <button
                      onClick={(e) => handleCreateCreditNote(e, invoice)}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors min-h-[44px]"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {tInvoice('creditNote')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Credit Notes Section */}
        {sortedCreditNotes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {tInvoice('creditNote')} ({sortedCreditNotes.length})
            </h2>

            {/* Desktop Table View for Credit Notes */}
            <div className="hidden md:block bg-white shadow overflow-x-auto sm:rounded-lg border-2 border-purple-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tInvoice('invoiceNumber')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tInvoice('originalInvoice')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tInvoice('client')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tInvoice('issueDate')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tInvoice('totalAmount')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tInvoice('vat')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tInvoice('grandTotal')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {tCommon('view')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedCreditNotes.map((creditNote) => (
                    <tr
                      key={creditNote.id}
                      onClick={() => handleInvoiceClick(creditNote)}
                      className="hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-900">
                        {creditNote.series} {creditNote.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {creditNote.originalInvoiceNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{creditNote.client.name}</div>
                        <div className="text-gray-500 text-xs">{tInvoice('cui')}: {creditNote.client.cui}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(creditNote.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        -{creditNote.totalAmount.toFixed(2)} {getCurrencyLabel(creditNote.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        -{creditNote.totalVat.toFixed(2)} {getCurrencyLabel(creditNote.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-900 text-right">
                        -{creditNote.grandTotal.toFixed(2)} {getCurrencyLabel(creditNote.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={(e) => handleDownloadPdfClick(e, creditNote)}
                            disabled={downloadingInvoiceId === creditNote.id}
                            className="inline-flex items-center px-3 py-1 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title={tInvoice('downloadPdf')}
                          >
                            {downloadingInvoiceId === creditNote.id ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                {tInvoice('generating')}
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                {tInvoice('downloadPdf')}
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for Credit Notes */}
            <div className="md:hidden space-y-4">
              {sortedCreditNotes.map((creditNote) => (
                <div
                  key={creditNote.id}
                  onClick={() => handleInvoiceClick(creditNote)}
                  className="bg-white shadow rounded-lg p-4 cursor-pointer hover:shadow-md active:bg-purple-50 transition-all border-2 border-purple-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-purple-900">
                        {creditNote.series} {creditNote.number}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {tInvoice('originalInvoice')}: {creditNote.originalInvoiceNumber || 'N/A'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(creditNote.date)}</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{creditNote.client.name}</p>
                      <p className="text-xs text-gray-500">{tInvoice('cui')}: {creditNote.client.cui}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">{tInvoice('totalAmount')}</p>
                      <p className="text-sm font-medium text-gray-900">-{creditNote.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{tInvoice('vat')}</p>
                      <p className="text-sm font-medium text-gray-900">-{creditNote.totalVat.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{tInvoice('grandTotal')}</p>
                      <p className="text-sm font-semibold text-purple-900">-{creditNote.grandTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <button
                      onClick={(e) => handleDownloadPdfClick(e, creditNote)}
                      disabled={downloadingInvoiceId === creditNote.id}
                      className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                    >
                      {downloadingInvoiceId === creditNote.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {tInvoice('generating')}
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          {tInvoice('downloadPdf')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Summary - Only for Regular Invoices */}
        {regularInvoices.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {tInvoice('totalInvoices')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {regularInvoices.length}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {tInvoice('totalRevenue')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {regularInvoices
                    .reduce((sum, inv) => sum + inv.grandTotal, 0)
                    .toFixed(2)}{' '}
                  RON
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {tInvoice('totalVat')}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {regularInvoices
                    .reduce((sum, inv) => sum + inv.totalVat, 0)
                    .toFixed(2)}{' '}
                  RON
                </dd>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceModalOpen}
        onClose={() => setIsCreateInvoiceModalOpen(false)}
      />

      {/* Create Credit Note Modal */}
      {isCreateCreditNoteModalOpen && creditNoteSourceInvoice && (
        <CreateCreditNoteModal
          isOpen={isCreateCreditNoteModalOpen}
          onClose={() => {
            setIsCreateCreditNoteModalOpen(false);
            setCreditNoteSourceInvoice(null);
          }}
          originalInvoice={creditNoteSourceInvoice}
          onCreditNoteCreated={handleCreditNoteCreated}
        />
      )}

      {/* Download Name Dialog */}
      <DownloadInvoiceNameDialog
        isOpen={showDownloadNameDialog}
        onClose={() => {
          setShowDownloadNameDialog(false);
          handleCancelDownload();
        }}
        onConfirm={handleConfirmDownload}
        defaultName={pendingDownload ? `Invoice_${pendingDownload.invoice.series}_${pendingDownload.invoice.number}` : 'Invoice'}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
