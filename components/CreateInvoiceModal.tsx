'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCreateInvoice, useGetLastInvoiceNumber } from '@/hooks/useInvoices';
import { useGetCompanies } from '@/hooks/useCompanies';
import { useGetClients } from '@/hooks/useClients';
import { CreateInvoiceRequest, InvoiceLine, Invoice, Currency, getCurrencyLabel, UNIT_OPTIONS, DEFAULT_UNIT } from '@/types/invoice';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: (invoice: Invoice) => void;
}

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
}: CreateInvoiceModalProps) {
  const router = useRouter();
  const tInvoice = useTranslations('invoice');
  const tClient = useTranslations('client');
  const tCompany = useTranslations('company');
  const tCommon = useTranslations('common');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [useExistingClient, setUseExistingClient] = useState<boolean>(true);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [customClientDetails, setCustomClientDetails] = useState({
    name: '',
    cui: '',
    address: '',
    county: '',
    regNumber: '',
    iban: '',
    bank: '',
  });
  const [currency, setCurrency] = useState<Currency>(Currency.RON);
  const [series, setSeries] = useState<string>('A');
  const [number, setNumber] = useState<number>(1);
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0, vat: 19, unit: DEFAULT_UNIT },
  ]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: companies } = useGetCompanies();
  const { data: clients } = useGetClients(selectedCompanyId || null);
  const { data: lastInvoiceNumber } = useGetLastInvoiceNumber(selectedCompanyId || null);
  const createInvoiceMutation = useCreateInvoice();

  const handleAddLine = () => {
    setInvoiceLines([
      ...invoiceLines,
      { description: '', quantity: 1, unitPrice: 0, totalPrice: 0, vat: 19, unit: DEFAULT_UNIT },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (invoiceLines.length > 1) {
      setInvoiceLines(invoiceLines.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (
    index: number,
    field: keyof InvoiceLine,
    value: string | number
  ) => {
    const updatedLines = [...invoiceLines];
    updatedLines[index] = {
      ...updatedLines[index],
      [field]: value,
    };

    // Auto-calculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity =
        field === 'quantity' ? Number(value) : updatedLines[index].quantity;
      const unitPrice =
        field === 'unitPrice' ? Number(value) : updatedLines[index].unitPrice;
      updatedLines[index].totalPrice = quantity * unitPrice;
    }

    setInvoiceLines(updatedLines);
  };

  const handleCustomClientChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCustomClientDetails((prev) => ({ ...prev, [name]: value }));
  };

  const calculateSubtotal = (): number => {
    return invoiceLines.reduce((sum, line) => sum + (line.totalPrice || line.lineTotal || 0), 0);
  };

  const calculateTotalVat = (): number => {
    return invoiceLines.reduce(
      (sum, line) => sum + ((line.totalPrice || line.lineTotal || 0) * (line.vat || line.vatRate || 0)) / 100,
      0
    );
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTotalVat();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedCompanyId) {
      setErrorMessage(tInvoice('selectCompanyRequired'));
      return;
    }

    if (useExistingClient && !selectedClientId) {
      setErrorMessage(tInvoice('selectClientRequired'));
      return;
    }

    if (
      !useExistingClient &&
      (!customClientDetails.name || !customClientDetails.cui)
    ) {
      setErrorMessage(tInvoice('clientNameCuiRequired'));
      return;
    }

    if (invoiceLines.length === 0 || !invoiceLines[0].description) {
      setErrorMessage(tInvoice('addAtLeastOneLine'));
      return;
    }

    const requestData: CreateInvoiceRequest = {
      currency,
      companyId: selectedCompanyId,
      series,
      number,
      issueDate,
      dueDate,
      invoiceLines: invoiceLines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.totalPrice,
        vat: line.vat,
        unit: line.unit || DEFAULT_UNIT,
      })),
    };

    if (useExistingClient) {
      requestData.clientId = selectedClientId;
    } else {
      requestData.clientDetails = customClientDetails;
    }

    try {
      const createdInvoice = await createInvoiceMutation.mutateAsync(requestData);
      setSuccessMessage(tInvoice('invoiceCreatedSuccess'));

      // Reset form and redirect after a brief delay
      setTimeout(() => {
        resetForm();
        onClose();

        // If callback is provided, use it (for custom behavior)
        if (onInvoiceCreated) {
          onInvoiceCreated(createdInvoice);
        } else {
          // Default behavior: redirect to invoices page with the new invoice
          router.push(`/invoices?companyId=${selectedCompanyId}&invoiceId=${createdInvoice.id}`);
        }
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          tInvoice('invoiceCreatedError')
      );
    }
  };

  const resetForm = () => {
    setSelectedCompanyId('');
    setUseExistingClient(true);
    setSelectedClientId('');
    setCustomClientDetails({
      name: '',
      cui: '',
      address: '',
      county: '',
      regNumber: '',
      iban: '',
      bank: '',
    });
    setCurrency(Currency.RON);
    setSeries('A');
    setNumber(1);
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setInvoiceLines([
      { description: '', quantity: 1, unitPrice: 0, totalPrice: 0, vat: 19, unit: DEFAULT_UNIT },
    ]);
    setErrorMessage('');
    setSuccessMessage('');
  };

  useEffect(() => {
    if (!selectedCompanyId) {
      setSelectedClientId('');
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (lastInvoiceNumber) {
      setSeries(lastInvoiceNumber.series);
      setNumber(lastInvoiceNumber.number + 1);
    }
  }, [lastInvoiceNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-4 sm:p-6 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{tInvoice('createInvoice')}</h3>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              {tInvoice('issuingCompany')}
            </h4>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700"
              >
                {tCompany('selectCompany')} <span className="text-red-500">*</span>
              </label>
              <select
                id="company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">{tCompany('selectCompany')}</option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} - {company.cui}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoice Series, Number and Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="series"
                className="block text-sm font-medium text-gray-700"
              >
                {tInvoice('series')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="series"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="number"
                className="block text-sm font-medium text-gray-700"
              >
                {tInvoice('number')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="number"
                min="1"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700"
              >
                {tInvoice('currency')} <span className="text-red-500">*</span>
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(Number(e.target.value) as Currency)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={Currency.RON}>RON</option>
                <option value={Currency.EUR}>EUR</option>
              </select>
            </div>
          </div>

          {/* Client Selection Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              {tClient('clientDetails')}
            </h4>

            {/* Toggle between existing and custom client */}
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={useExistingClient}
                    onChange={() => setUseExistingClient(true)}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {tClient('existingClient')}
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!useExistingClient}
                    onChange={() => setUseExistingClient(false)}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {tClient('customClientDetails')}
                  </span>
                </label>
              </div>
            </div>

            {useExistingClient ? (
              <div>
                <label
                  htmlFor="client"
                  className="block text-sm font-medium text-gray-700"
                >
                  {tClient('selectClient')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required={useExistingClient}
                  disabled={!selectedCompanyId}
                >
                  <option value="">
                    {selectedCompanyId
                      ? tClient('selectClient')
                      : tClient('selectCompanyFirst')}
                  </option>
                  {clients?.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.cui}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {tClient('clientName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customClientDetails.name}
                    onChange={handleCustomClientChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required={!useExistingClient}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {tCompany('cui')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cui"
                    value={customClientDetails.cui}
                    onChange={handleCustomClientChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required={!useExistingClient}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {tCompany('address')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customClientDetails.address}
                    onChange={handleCustomClientChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {tCompany('county')}
                  </label>
                  <input
                    type="text"
                    name="county"
                    value={customClientDetails.county}
                    onChange={handleCustomClientChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {tCompany('regNumber')}
                  </label>
                  <input
                    type="text"
                    name="regNumber"
                    value={customClientDetails.regNumber}
                    onChange={handleCustomClientChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {tCompany('iban')}
                  </label>
                  <input
                    type="text"
                    name="iban"
                    value={customClientDetails.iban}
                    onChange={handleCustomClientChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {tCompany('bank')}
                  </label>
                  <input
                    type="text"
                    name="bank"
                    value={customClientDetails.bank}
                    onChange={handleCustomClientChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Invoice Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="issueDate"
                className="block text-sm font-medium text-gray-700"
              >
                {tInvoice('issueDate')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="issueDate"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                {tInvoice('dueDate')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Invoice Lines */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                {tInvoice('invoiceLines')}
              </h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {tInvoice('addLine')}
              </button>
            </div>

            <div className="space-y-3">
              {invoiceLines.map((line, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded border border-gray-200"
                >
                  {/* Mobile: Stack all fields vertically */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2 sm:items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {tInvoice('description')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) =>
                          handleLineChange(index, 'description', e.target.value)
                        }
                        className="block w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    {/* Mobile: 2-column grid for quantity and unit */}
                    <div className="grid grid-cols-2 gap-2 sm:contents">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {tInvoice('quantity')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.quantity}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              'quantity',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="block w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {tInvoice('unit')}
                        </label>
                        <input
                          type="text"
                          list={`unit-options-${index}`}
                          maxLength={20}
                          value={line.unit ?? DEFAULT_UNIT}
                          onChange={(e) =>
                            handleLineChange(index, 'unit', e.target.value)
                          }
                          className="block w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <datalist id={`unit-options-${index}`}>
                          {UNIT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Mobile: 2-column grid for unit price and VAT */}
                    <div className="grid grid-cols-2 gap-2 sm:contents">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {tInvoice('unitPrice')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unitPrice}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              'unitPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="block w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {tInvoice('vat')} %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.vat}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              'vat',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="block w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Total - full width on mobile */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {tInvoice('total')}
                      </label>
                      <input
                        type="text"
                        value={(line.totalPrice || line.lineTotal || 0).toFixed(2)}
                        readOnly
                        className="block w-full px-2 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>

                    {/* Remove button - full width on mobile */}
                    <div className="sm:col-span-1 sm:flex sm:items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        disabled={invoiceLines.length === 1}
                        className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        title={tInvoice('removeLine')}
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
                        <span className="sm:hidden">{tInvoice('remove')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 bg-white p-4 rounded border border-gray-200">
              <div className="flex justify-end space-y-2">
                <div className="w-64">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{tInvoice('subtotal')}:</span>
                    <span className="text-gray-900">
                      {calculateSubtotal().toFixed(2)} {getCurrencyLabel(currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{tInvoice('totalVat')}:</span>
                    <span className="text-gray-900">
                      {calculateTotalVat().toFixed(2)} {getCurrencyLabel(currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                    <span className="text-gray-900">{tInvoice('total')}:</span>
                    <span className="text-indigo-600">
                      {calculateTotal().toFixed(2)} {getCurrencyLabel(currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={createInvoiceMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createInvoiceMutation.isPending
                ? tInvoice('creating')
                : tInvoice('createInvoiceButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
