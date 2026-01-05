'use client';

import { useState, FormEvent } from 'react';
import {
  useCreateClient,
  useGetAnafClientDetails,
  CreateClientRequest,
} from '@/hooks/useClients';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export default function CreateClientModal({
  isOpen,
  onClose,
  companyId,
}: CreateClientModalProps) {
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: '',
    cui: '',
    address: '',
    county: '',
    city: '',
    country: '',
    regNumber: '',
    iban: '',
    bank: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createClientMutation = useCreateClient(companyId);
  const getAnafDetailsMutation = useGetAnafClientDetails();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFetchAnafData = async () => {
    if (!formData.cui.trim()) {
      setErrorMessage('Please enter a CUI before fetching ANAF data');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const anafData = await getAnafDetailsMutation.mutateAsync(formData.cui);

      // Update form with ANAF data
      setFormData((prev) => ({
        ...prev,
        name: anafData.name || prev.name,
        address: anafData.address || prev.address,
        county: anafData.county || prev.county,
        city: anafData.city || prev.city,
        country: anafData.country || prev.country,
        regNumber: anafData.regNumber || prev.regNumber,
      }));

      setSuccessMessage('Client data fetched successfully from ANAF');
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Failed to fetch client data from ANAF'
      );
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.cui.trim()) {
      setErrorMessage('Name and CUI are required');
      return;
    }

    try {
      await createClientMutation.mutateAsync(formData);
      setSuccessMessage('Client created successfully!');

      // Reset form and close modal after a brief delay
      setTimeout(() => {
        setFormData({
          name: '',
          cui: '',
          address: '',
          county: '',
          city: '',
          country: '',
          regNumber: '',
          iban: '',
          bank: '',
        });
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Failed to create client. Please try again.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-20 mx-auto p-4 sm:p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Create New Client</h3>
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
          {/* CUI with ANAF fetch button */}
          <div>
            <label htmlFor="cui" className="block text-sm font-medium text-gray-700">
              CUI <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="cui"
                id="cui"
                required
                value={formData.cui}
                onChange={handleInputChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter CUI"
              />
              <button
                type="button"
                onClick={handleFetchAnafData}
                disabled={getAnafDetailsMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {getAnafDetailsMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Fetch from ANAF
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* County */}
          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700">
              County
            </label>
            <input
              type="text"
              name="county"
              id="county"
              value={formData.county}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="city"
              id="city"
              value={formData.city}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              name="country"
              id="country"
              value={formData.country}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Registration Number */}
          <div>
            <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              type="text"
              name="regNumber"
              id="regNumber"
              value={formData.regNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* IBAN */}
          <div>
            <label htmlFor="iban" className="block text-sm font-medium text-gray-700">
              IBAN
            </label>
            <input
              type="text"
              name="iban"
              id="iban"
              value={formData.iban}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Bank */}
          <div>
            <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
              Bank
            </label>
            <input
              type="text"
              name="bank"
              id="bank"
              value={formData.bank}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createClientMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createClientMutation.isPending ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
