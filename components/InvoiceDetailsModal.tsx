'use client';

import { Invoice, AnafSubmissionStatus } from '@/types/invoice';
import { useGenerateInvoicePdf, useDownloadInvoiceXml, useSendEfactura, useGetAnafSubmissionStatus, useDownloadAnafResponse } from '@/hooks/useInvoices';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import DownloadInvoiceNameDialog from './DownloadInvoiceNameDialog';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function InvoiceDetailsModal({ isOpen, onClose, invoice }: InvoiceDetailsModalProps) {
  const tInvoice = useTranslations('invoice');
  const tCommon = useTranslations('common');
  const generatePdfMutation = useGenerateInvoicePdf();
  const sendEfacturaMutation = useSendEfactura();
  const downloadAnafResponseMutation = useDownloadAnafResponse();
  const { data: anafStatus } = useGetAnafSubmissionStatus(invoice?.id || null);
  const downloadXmlMutation = useDownloadInvoiceXml();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingXml, setIsDownloadingXml] = useState(false);
  const [isDownloadingAnafResponse, setIsDownloadingAnafResponse] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDownloadNameDialog, setShowDownloadNameDialog] = useState(false);
  const [pendingPdfBlob, setPendingPdfBlob] = useState<Blob | null>(null);

  const handleDownloadXmlClick = async () => {
    if (!invoice) return;

    setIsDownloadingXml(true);
    try {
      const xmlBlob = await downloadXmlMutation.mutateAsync(invoice.id);
      const url = window.URL.createObjectURL(xmlBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.series}_${invoice.number}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download XML:', error);
      alert(tInvoice('invoiceCreatedError'));
    } finally {
      setIsDownloadingXml(false);
    }
  };

  const handleDownloadPdfClick = async () => {
    if (!invoice) return;

    setIsDownloading(true);
    try {
      const pdfBlob = await generatePdfMutation.mutateAsync(invoice.id);
      setPendingPdfBlob(pdfBlob);
      setShowDownloadNameDialog(true);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert(tInvoice('invoiceCreatedError'));
      setIsDownloading(false);
    }
  };

  const handleConfirmDownload = (customName: string) => {
    if (!pendingPdfBlob || !invoice) return;

    try {
      // Create a download link
      const url = window.URL.createObjectURL(pendingPdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert(tInvoice('invoiceCreatedError'));
    } finally {
      setPendingPdfBlob(null);
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {
    setPendingPdfBlob(null);
    setIsDownloading(false);
  };

  const handleSendEfactura = async () => {
    if (!invoice) return;

    try {
      await sendEfacturaMutation.mutateAsync(invoice.id);
    } catch (error: any) {
      console.error('Failed to send EFactura:', error);
    }
  };

  const handleDownloadAnafResponse = async () => {
    if (!invoice) return;

    setIsDownloadingAnafResponse(true);
    try {
      const blob = await downloadAnafResponseMutation.mutateAsync(invoice.id);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ANAF_Response_${invoice.series}_${invoice.number}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download ANAF response:', error);
      alert(tInvoice('invoiceCreatedError'));
    } finally {
      setIsDownloadingAnafResponse(false);
    }
  };

  const getSubmissionButtonContent = () => {
    if (!anafStatus || !anafStatus.id) {
      // No submission yet - show Send button
      return {
        disabled: false,
        onClick: handleSendEfactura,
        className: 'bg-green-600 hover:bg-green-700',
        content: (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {tInvoice('sendEfactura')}
          </>
        ),
      };
    }

    switch (anafStatus.status) {
      case AnafSubmissionStatus.Pending:
      case AnafSubmissionStatus.Processing:
        // Show loading state
        return {
          disabled: true,
          onClick: () => {},
          className: 'bg-yellow-600 cursor-not-allowed',
          content: (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {anafStatus.status === AnafSubmissionStatus.Pending ? tInvoice('pending') : tInvoice('processing')}
            </>
          ),
        };

      case AnafSubmissionStatus.Ok:
        // Show success state
        return {
          disabled: true,
          onClick: () => {},
          className: 'bg-green-600 cursor-not-allowed',
          content: (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {tInvoice('efacturaSentSuccessfully')}
            </>
          ),
        };

      case AnafSubmissionStatus.Error:
        // Show error state with retry option and error button
        return {
          disabled: false,
          onClick: handleSendEfactura,
          className: 'bg-red-600 hover:bg-red-700',
          content: (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {tInvoice('retrySend')}
            </>
          ),
        };

      default:
        return {
          disabled: false,
          onClick: handleSendEfactura,
          className: 'bg-green-600 hover:bg-green-700',
          content: (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {tInvoice('sendEfactura')}
            </>
          ),
        };
    }
  };

  const submissionButton = getSubmissionButtonContent();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-4 sm:p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {tCommon('invoice')} {invoice.series} {invoice.number}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {tInvoice('issueDate')}: {formatDate(invoice.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        {/* Company and Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Company Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{tInvoice('from')}</h4>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{invoice.company.name}</p>
              <p className="text-sm text-gray-600">{tInvoice('cui')}: {invoice.company.cui}</p>
              {invoice.company.regNumber && (
                <p className="text-sm text-gray-600">{tInvoice('regNo')}: {invoice.company.regNumber}</p>
              )}
              {invoice.company.address && (
                <p className="text-sm text-gray-600">{invoice.company.address}</p>
              )}
              {invoice.company.county && (
                <p className="text-sm text-gray-600">{invoice.company.county}</p>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{tInvoice('to')}</h4>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{invoice.client.name}</p>
              <p className="text-sm text-gray-600">{tInvoice('cui')}: {invoice.client.cui}</p>
              {invoice.client.regNumber && (
                <p className="text-sm text-gray-600">{tInvoice('regNo')}: {invoice.client.regNumber}</p>
              )}
              {invoice.client.address && (
                <p className="text-sm text-gray-600">{invoice.client.address}</p>
              )}
              {invoice.client.county && (
                <p className="text-sm text-gray-600">{invoice.client.county}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Lines */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">{tInvoice('items')}</h4>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tInvoice('description')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tInvoice('quantity')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tInvoice('unitPrice')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tInvoice('vat')} (%)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tInvoice('total')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.invoiceLines.map((line, index) => (
                  <tr key={line.id || index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{line.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {line.quantity} {line.unit || 'buc'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {line.unitPrice.toFixed(2)} RON
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{(line.vatRate || line.vat || 0)}%</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                      {((line.lineTotal || line.totalPrice || (line.quantity * line.unitPrice)) || 0).toFixed(2)} RON
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {invoice.invoiceLines.map((line, index) => (
              <div key={line.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="font-medium text-gray-900 mb-2">{line.description}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">{tInvoice('quantity')}:</span>
                    <span className="ml-1 text-gray-900">{line.quantity} {line.unit || 'buc'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">{tInvoice('unitPrice')}:</span>
                    <span className="ml-1 text-gray-900">{line.unitPrice.toFixed(2)} RON</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{tInvoice('vat')}:</span>
                    <span className="ml-1 text-gray-900">{(line.vatRate || line.vat || 0)}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">{tInvoice('total')}:</span>
                    <span className="ml-1 font-medium text-gray-900">{((line.lineTotal || line.totalPrice || (line.quantity * line.unitPrice)) || 0).toFixed(2)} RON</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{tInvoice('subtotal')}:</span>
              <span className="text-sm text-gray-900">{invoice.totalAmount.toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{tInvoice('totalVat')}:</span>
              <span className="text-sm text-gray-900">{invoice.totalVat.toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-base font-bold text-gray-900">{tInvoice('grandTotal')}:</span>
              <span className="text-base font-bold text-indigo-600">{invoice.grandTotal.toFixed(2)} RON</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          {anafStatus?.status === AnafSubmissionStatus.Error && anafStatus.errorMessage && (
            <button
              onClick={() => setShowErrorModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors min-h-[44px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {tInvoice('viewError')}
            </button>
          )}
          {anafStatus?.status === AnafSubmissionStatus.Ok && anafStatus.downloadId && (
            <button
              onClick={handleDownloadAnafResponse}
              disabled={isDownloadingAnafResponse}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              {isDownloadingAnafResponse ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {tInvoice('downloading')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {tInvoice('downloadAnafResponse')}
                </>
              )}
            </button>
          )}
          <button
            onClick={submissionButton.onClick}
            disabled={submissionButton.disabled}
            className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white ${submissionButton.className} rounded-md disabled:opacity-50 transition-colors min-h-[44px]`}
          >
            {submissionButton.content}
          </button>
          <button
            onClick={handleDownloadPdfClick}
            disabled={isDownloading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isDownloading ? (
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
          <button
            onClick={handleDownloadXmlClick}
            disabled={isDownloadingXml}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isDownloadingXml ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {tInvoice('downloading')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {tInvoice('downloadXml')}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]"
          >
            {tCommon('close')}
          </button>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && anafStatus?.errorMessage && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{tInvoice('anafSubmissionError')}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{anafStatus.errorMessage}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
              >
                {tCommon('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Name Dialog */}
      <DownloadInvoiceNameDialog
        isOpen={showDownloadNameDialog}
        onClose={() => {
          setShowDownloadNameDialog(false);
          handleCancelDownload();
        }}
        onConfirm={handleConfirmDownload}
        defaultName={invoice ? `Invoice_${invoice.series}_${invoice.number}` : 'Invoice'}
      />
    </div>
  );
}
