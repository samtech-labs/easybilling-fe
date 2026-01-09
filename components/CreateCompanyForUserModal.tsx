'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateCompanyForUser } from '@/hooks/useAdmin';
import { useGetAnafCompanyDetails } from '@/hooks/useCompanies';
import { CreateCompanyForUserRequest, UserResponseDto } from '@/types/user';
import { X } from 'lucide-react';

interface CreateCompanyForUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponseDto;
}

export default function CreateCompanyForUserModal({ isOpen, onClose, user }: CreateCompanyForUserModalProps) {
  const tCompany = useTranslations('company');
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<CreateCompanyForUserRequest>({
    userId: user.id,
    name: '',
    cui: '',
    address: '',
    county: '',
    city: '',
    country: '',
    regNumber: '',
    iban: '',
    bank: '',
    isVatPayer: false,
    isEFacturaActive: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createCompanyMutation = useCreateCompanyForUser();
  const getAnafDetailsMutation = useGetAnafCompanyDetails();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: user.id,
        name: '',
        cui: '',
        address: '',
        county: '',
        city: '',
        country: '',
        regNumber: '',
        iban: '',
        bank: '',
        isVatPayer: false,
        isEFacturaActive: false,
      });
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, user.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFetchAnafData = async () => {
    if (!formData.cui.trim()) {
      setErrorMessage(tCompany('cuiRequired'));
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
        isVatPayer: anafData.isVatPayer,
        isEFacturaActive: anafData.isEFacturaActive,
      }));

      setSuccessMessage(tCompany('fetchedFromAnafSuccess'));
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || tCompany('fetchedFromAnafError')
      );
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.cui.trim()) {
      setErrorMessage(tCompany('nameAndCuiRequired'));
      return;
    }

    try {
      await createCompanyMutation.mutateAsync(formData);
      setSuccessMessage(tAdmin('companyAssignedSuccess'));

      // Reset form and close modal after 1.5 seconds
      setTimeout(() => {
        setFormData({
          userId: user.id,
          name: '',
          cui: '',
          address: '',
          county: '',
          city: '',
          country: '',
          regNumber: '',
          iban: '',
          bank: '',
          isVatPayer: false,
          isEFacturaActive: false,
        });
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || tAdmin('companyAssignedError')
      );
    }
  };

  const handleClose = () => {
    setFormData({
      userId: user.id,
      name: '',
      cui: '',
      address: '',
      county: '',
      city: '',
      country: '',
      regNumber: '',
      iban: '',
      bank: '',
      isVatPayer: false,
      isEFacturaActive: false,
    });
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-4 sm:p-6 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{tAdmin('createCompanyForUser')}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Utilizator: <span className="font-medium">{user.username}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="cui" className="block text-sm font-medium text-gray-700">
                  {tCompany('cui')} <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    id="cui"
                    name="cui"
                    value={formData.cui}
                    onChange={handleInputChange}
                    placeholder={tCompany('enterCui')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleFetchAnafData}
                    disabled={getAnafDetailsMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {getAnafDetailsMutation.isPending ? tCompany('fetching') : tCompany('fetchFromAnaf')}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {tCompany('companyName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={tCompany('enterCompanyName')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  {tCompany('address')}
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={tCompany('enterAddress')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700">
                  {tCompany('county')}
                </label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  placeholder={tCompany('enterCounty')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  {tCompany('city')}
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder={tCompany('enterCity')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  {tCompany('country')}
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700">
                  {tCompany('regNumber')}
                </label>
                <input
                  type="text"
                  id="regNumber"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleInputChange}
                  placeholder={tCompany('enterRegNumber')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="iban" className="block text-sm font-medium text-gray-700">
                  {tCompany('iban')}
                </label>
                <input
                  type="text"
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  placeholder={tCompany('enterIban')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
                  {tCompany('bank')}
                </label>
                <input
                  type="text"
                  id="bank"
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  placeholder={tCompany('enterBank')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVatPayer"
                    name="isVatPayer"
                    checked={formData.isVatPayer}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVatPayer" className="ml-2 block text-sm text-gray-700">
                    {tCompany('isVatPayer')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEFacturaActive"
                    name="isEFacturaActive"
                    checked={formData.isEFacturaActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isEFacturaActive" className="ml-2 block text-sm text-gray-700">
                    {tCompany('isEFacturaActive')}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={createCompanyMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCompanyMutation.isPending ? tCommon('loading') : tCommon('create')}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
