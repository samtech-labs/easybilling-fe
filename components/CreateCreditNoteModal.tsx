'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateCreditNote } from '@/hooks/useInvoices';
import { Invoice, InvoiceLine, CreateCreditNoteRequest } from '@/types/invoice';

interface CreateCreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalInvoice: Invoice;
  onCreditNoteCreated?: (creditNote: Invoice) => void;
}

export default function CreateCreditNoteModal({
  isOpen,
  onClose,
  originalInvoice,
  onCreditNoteCreated,
}: CreateCreditNoteModalProps) {
  const tInvoice = useTranslations('invoice');
  const tCommon = useTranslations('common');

  const [series, setSeries] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [creditNoteLines, setCreditNoteLines] = useState<InvoiceLine[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createCreditNoteMutation = useCreateCreditNote();

  // Initialize credit note lines from original invoice
  useEffect(() => {
    if (isOpen && originalInvoice) {
      // Copy all invoice lines from the original invoice
      const copiedLines = (originalInvoice.invoiceLines || []).map((line) => ({
        id: line.id,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        vat: line.vatRate || line.vat || 0,
        vatRate: line.vatRate || line.vat || 0,
        unit: line.unit || 'buc',
      }));

      // If no lines, add a default empty line
      if (copiedLines.length === 0) {
        copiedLines.push({
          description: '',
          quantity: 1,
          unitPrice: 0,
          vat: 19,
          vatRate: 19,
          unit: 'buc'
        });
      }

      setCreditNoteLines(copiedLines);

      // Use same series as original invoice
      setSeries(originalInvoice.series);
      setNumber('');

      // Reset messages
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, originalInvoice]);

  const handleAddLine = () => {
    setCreditNoteLines([
      ...creditNoteLines,
      { description: '', quantity: 1, unitPrice: 0, vat: 19, vatRate: 19, unit: 'buc' },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (creditNoteLines.length > 1) {
      setCreditNoteLines(creditNoteLines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (
    index: number,
    field: keyof InvoiceLine,
    value: string | number
  ) => {
    const updatedLines = [...creditNoteLines];
    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value,
    };

    // Keep vat and vatRate in sync
    if (field === 'vat' || field === 'vatRate') {
      updatedLines[index].vat = Number(value);
      updatedLines[index].vatRate = Number(value);
    }

    setCreditNoteLines(updatedLines);
  };

  const calculateLineTotal = (line: InvoiceLine) => {
    return (line.quantity || 0) * (line.unitPrice || 0);
  };

  const calculateSubtotal = () => {
    return creditNoteLines.reduce(
      (sum, line) => sum + calculateLineTotal(line),
      0
    );
  };

  const calculateTotalVat = () => {
    return creditNoteLines.reduce(
      (sum, line) =>
        sum + calculateLineTotal(line) * ((line.vatRate || line.vat || 0) / 100),
      0
    );
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalVat();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate lines
    if (creditNoteLines.length === 0) {
      setErrorMessage(tInvoice('addAtLeastOneLine'));
      return;
    }

    // Prepare request
    const requestData: CreateCreditNoteRequest = {
      originalInvoiceId: originalInvoice.id,
      series: series || undefined,
      number: number || undefined,
      lines: creditNoteLines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        vatRate: line.vatRate || line.vat || 0,
        vat: line.vatRate || line.vat || 0,
        unit: line.unit || 'buc',
      })),
    };

    try {
      const creditNote = await createCreditNoteMutation.mutateAsync(requestData);
      setSuccessMessage(tInvoice('creditNoteCreatedSuccess'));

      if (onCreditNoteCreated) {
        onCreditNoteCreated(creditNote);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || tInvoice('creditNoteCreatedError')
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-4 sm:p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {tInvoice('createCreditNote')}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {tInvoice('creditNoteFor')} {originalInvoice.series} {originalInvoice.number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            &times;
          </button>
        </div>

        {/* Original Invoice Info Banner */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">
            {tInvoice('originalInvoice')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-xs text-purple-700">{tInvoice('invoiceNumber')}:</span>
              <p className="text-sm font-medium text-purple-900">{originalInvoice.series}-{originalInvoice.number}</p>
            </div>
            <div>
              <span className="text-xs text-purple-700">{tInvoice('client')}:</span>
              <p className="text-sm font-medium text-purple-900">{originalInvoice.client.name}</p>
            </div>
            <div>
              <span className="text-xs text-purple-700">{tInvoice('grandTotal')}:</span>
              <p className="text-sm font-medium text-purple-900">{originalInvoice.grandTotal.toFixed(2)} RON</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Series and Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-1">
                {tInvoice('series')}
              </label>
              <input
                type="text"
                id="series"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={originalInvoice.series}
              />
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                {tInvoice('number')}
              </label>
              <input
                type="text"
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={tInvoice('number')}
              />
            </div>
          </div>

          {/* Company and Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Company Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{tInvoice('from')}</h4>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{originalInvoice.company.name}</p>
                <p className="text-sm text-gray-600">{tInvoice('cui')}: {originalInvoice.company.cui}</p>
                {originalInvoice.company.regNumber && (
                  <p className="text-sm text-gray-600">{tInvoice('regNo')}: {originalInvoice.company.regNumber}</p>
                )}
                {originalInvoice.company.address && (
                  <p className="text-sm text-gray-600">{originalInvoice.company.address}</p>
                )}
                {originalInvoice.company.county && (
                  <p className="text-sm text-gray-600">{originalInvoice.company.county}</p>
                )}
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{tInvoice('to')}</h4>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{originalInvoice.client.name}</p>
                <p className="text-sm text-gray-600">{tInvoice('cui')}: {originalInvoice.client.cui}</p>
                {originalInvoice.client.regNumber && (
                  <p className="text-sm text-gray-600">{tInvoice('regNo')}: {originalInvoice.client.regNumber}</p>
                )}
                {originalInvoice.client.address && (
                  <p className="text-sm text-gray-600">{originalInvoice.client.address}</p>
                )}
                {originalInvoice.client.county && (
                  <p className="text-sm text-gray-600">{originalInvoice.client.county}</p>
                )}
              </div>
            </div>
          </div>

          {/* Credit Note Lines */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-700">{tInvoice('creditNoteLines')}</h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center px-3 py-1 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {tInvoice('addLine')}
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tInvoice('description')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      {tInvoice('quantity')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      {tInvoice('unitPrice')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      {tInvoice('vat')} (%)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      {tInvoice('total')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      {tCommon('delete')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditNoteLines.map((line, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder={tInvoice('description')}
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={line.vatRate || line.vat || 0}
                          onChange={(e) => handleLineChange(index, 'vatRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {calculateLineTotal(line).toFixed(2)} RON
                      </td>
                      <td className="px-4 py-3 text-center">
                        {creditNoteLines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {creditNoteLines.map((line, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{tInvoice('description')}</label>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder={tInvoice('description')}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{tInvoice('quantity')}</label>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{tInvoice('unitPrice')}</label>
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{tInvoice('vat')} (%)</label>
                        <input
                          type="number"
                          value={line.vatRate || line.vat || 0}
                          onChange={(e) => handleLineChange(index, 'vatRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{tInvoice('total')}</label>
                        <div className="px-2 py-1 text-sm font-medium text-gray-900 bg-white rounded border border-gray-200">
                          {calculateLineTotal(line).toFixed(2)} RON
                        </div>
                      </div>
                    </div>
                    {creditNoteLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="w-full px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors min-h-[44px]"
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {tInvoice('removeLine')}
                      </button>
                    )}
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
                <span className="text-sm text-gray-900">{calculateSubtotal().toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{tInvoice('totalVat')}:</span>
                <span className="text-sm text-gray-900">{calculateTotalVat().toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <span className="text-base font-bold text-gray-900">{tInvoice('grandTotal')}:</span>
                <span className="text-base font-bold text-purple-600">{calculateGrandTotal().toFixed(2)} RON</span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">{errorMessage}</h3>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-h-[44px]"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={createCreditNoteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {createCreditNoteMutation.isPending
                ? tInvoice('creating')
                : tInvoice('createCreditNote')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
