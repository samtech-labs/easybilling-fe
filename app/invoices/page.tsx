'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetInvoices, useGenerateInvoicePdf } from '@/hooks/useInvoices';
import { useGetCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { Invoice } from '@/types/invoice';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';
import AnafIntegration from '@/components/AnafIntegration';
import InvoiceDetailsModal from '@/components/InvoiceDetailsModal';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || '';
  const invoiceId = searchParams.get('invoiceId');
  const { isAuthenticated, logout } = useAuth();
  const { data: companies } = useGetCompanies();
  const { data: invoices, isLoading, error } = useGetInvoices(companyId);
  const generatePdfMutation = useGenerateInvoicePdf();
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);

  const company = companies?.find((c) => c.id === companyId);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadPdf = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation(); // Prevent row click event
    setDownloadingInvoiceId(invoice.id);
    try {
      const pdfBlob = await generatePdfMutation.mutateAsync(invoice.id);

      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoice.series}_${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingInvoiceId(null);
    }
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
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!companyId) {
      router.push('/companies');
    }
  }, [companyId, router]);

  // Auto-open invoice modal when invoiceId is in URL
  useEffect(() => {
    if (invoiceId && invoices && !isLoading) {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setIsInvoiceModalOpen(true);
        // Remove invoiceId from URL after opening modal
        const newUrl = `/invoices?companyId=${companyId}`;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [invoiceId, invoices, isLoading, companyId, router]);

  if (!isAuthenticated) {
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
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error loading invoices. Please try again.</p>
          <button
            onClick={() => router.push('/companies')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  // Sort invoices by issue date (most recent first)
  const sortedInvoices = [...(invoices || [])].sort((a, b) => {
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoices</h1>
              {company && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{company.name}</span>
                  <span className="hidden sm:inline"> - {company.cui}</span>
                  <span className="block sm:hidden text-xs">CUI: {company.cui}</span>
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
              <span className="hidden sm:inline">New Invoice</span>
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
              <h2 className="text-lg font-semibold text-gray-900">E-Factura Integration</h2>
              <p className="mt-1 text-sm text-gray-600">
                Connect your digital certificate to enable electronic invoicing with ANAF.
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

        {sortedInvoices.length === 0 ? (
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
            <p className="mt-4 text-gray-600">No invoices found for this company.</p>
            <button
              onClick={() => router.push('/companies')}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Create New Invoice
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
                      Invoice Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Client
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Issue Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      VAT
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Grand Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedInvoices.map((invoice) => (
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
                        <div className="text-gray-500 text-xs">CUI: {invoice.client.cui}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {invoice.totalAmount.toFixed(2)} RON
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {invoice.totalVat.toFixed(2)} RON
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {invoice.grandTotal.toFixed(2)} RON
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={(e) => handleDownloadPdf(e, invoice)}
                          disabled={downloadingInvoiceId === invoice.id}
                          className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Download PDF"
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
                              Generating...
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
                              Download PDF
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - Hidden on desktop */}
            <div className="md:hidden space-y-4">
              {sortedInvoices.map((invoice) => (
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
                      <p className="text-xs text-gray-500">CUI: {invoice.client.cui}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Grand Total</p>
                      <p className="text-lg font-bold text-indigo-600">{invoice.grandTotal.toFixed(2)} RON</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Issue Date</p>
                      <p className="font-medium text-gray-900">{formatDate(invoice.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-medium text-gray-900">{invoice.totalAmount.toFixed(2)} RON</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">VAT</p>
                      <p className="font-medium text-gray-900">{invoice.totalVat.toFixed(2)} RON</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDownloadPdf(e, invoice)}
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
                        Generating PDF...
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
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Stats Summary */}
        {sortedInvoices.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Invoices
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {sortedInvoices.length}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Revenue
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {sortedInvoices
                    .reduce((sum, inv) => sum + inv.grandTotal, 0)
                    .toFixed(2)}{' '}
                  RON
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total VAT
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {sortedInvoices
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
    </div>
  );
}
