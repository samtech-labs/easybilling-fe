'use client';

import { Invoice } from '@/types/invoice';
import { useGenerateInvoicePdf } from '@/hooks/useInvoices';
import { useState } from 'react';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function InvoiceDetailsModal({ isOpen, onClose, invoice }: InvoiceDetailsModalProps) {
  const generatePdfMutation = useGenerateInvoicePdf();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice) return;

    setIsDownloading(true);
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
      setIsDownloading(false);
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

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-4 sm:p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Invoice {invoice.series} {invoice.number}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Issue Date: {formatDate(invoice.date)}
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
            <h4 className="text-sm font-semibold text-gray-700 mb-2">From</h4>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{invoice.company.name}</p>
              <p className="text-sm text-gray-600">CUI: {invoice.company.cui}</p>
              {invoice.company.regNumber && (
                <p className="text-sm text-gray-600">Reg No: {invoice.company.regNumber}</p>
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
            <h4 className="text-sm font-semibold text-gray-700 mb-2">To</h4>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{invoice.client.name}</p>
              <p className="text-sm text-gray-600">CUI: {invoice.client.cui}</p>
              {invoice.client.regNumber && (
                <p className="text-sm text-gray-600">Reg No: {invoice.client.regNumber}</p>
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
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Items</h4>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VAT (%)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.invoiceLines.map((line, index) => (
                  <tr key={line.id || index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{line.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.quantity}</td>
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
                    <span className="text-gray-500">Quantity:</span>
                    <span className="ml-1 text-gray-900">{line.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">Unit Price:</span>
                    <span className="ml-1 text-gray-900">{line.unitPrice.toFixed(2)} RON</span>
                  </div>
                  <div>
                    <span className="text-gray-500">VAT:</span>
                    <span className="ml-1 text-gray-900">{(line.vatRate || line.vat || 0)}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">Total:</span>
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
              <span className="text-sm font-medium text-gray-700">Subtotal:</span>
              <span className="text-sm text-gray-900">{invoice.totalAmount.toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total VAT:</span>
              <span className="text-sm text-gray-900">{invoice.totalVat.toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-base font-bold text-gray-900">Grand Total:</span>
              <span className="text-base font-bold text-indigo-600">{invoice.grandTotal.toFixed(2)} RON</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={handleDownloadPdf}
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
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
