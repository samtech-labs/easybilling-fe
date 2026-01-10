'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateMembershipType } from '@/hooks/useAdmin';
import { CreateMembershipTypeRequest } from '@/types/membershipType';
import { X } from 'lucide-react';

interface CreateMembershipTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateMembershipTypeModal({ isOpen, onClose }: CreateMembershipTypeModalProps) {
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<CreateMembershipTypeRequest>({
    name: '',
    price: 0,
    maxInvoicesPerMonth: 0,
    eFacturaActive: false,
    durationInDays: 30,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const createMembershipTypeMutation = useCreateMembershipType();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage(tAdmin('nameRequired'));
      return;
    }

    if (formData.name.length < 3) {
      setErrorMessage(tAdmin('minNameLength'));
      return;
    }

    if (formData.price < 0) {
      setErrorMessage(tAdmin('priceMinValue'));
      return;
    }

    if (formData.maxInvoicesPerMonth < 1) {
      setErrorMessage(tAdmin('maxInvoicesMinValue'));
      return;
    }

    if (formData.durationInDays < 1) {
      setErrorMessage(tAdmin('durationMinValue'));
      return;
    }

    try {
      await createMembershipTypeMutation.mutateAsync(formData);
      setSuccessMessage(tAdmin('membershipTypeCreatedSuccess'));

      // Reset form and close modal after 1.5 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          price: 0,
          maxInvoicesPerMonth: 0,
          eFacturaActive: false,
          durationInDays: 30,
        });
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || tAdmin('membershipTypeCreatedError')
      );
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      price: 0,
      maxInvoicesPerMonth: 0,
      eFacturaActive: false,
      durationInDays: 30,
    });
    setErrorMessage('');
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-4 sm:p-6 border w-11/12 max-w-md shadow-lg rounded-md bg-white mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{tAdmin('createMembershipType')}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label={tCommon('close')}
          >
            <X size={24} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {tAdmin('membershipTypeName')} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={tAdmin('enterMembershipTypeName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              {tAdmin('price')} (RON) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder={tAdmin('enterPrice')}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="maxInvoicesPerMonth" className="block text-sm font-medium text-gray-700 mb-1">
              {tAdmin('maxInvoicesPerMonth')} *
            </label>
            <input
              type="number"
              id="maxInvoicesPerMonth"
              name="maxInvoicesPerMonth"
              value={formData.maxInvoicesPerMonth}
              onChange={handleInputChange}
              placeholder={tAdmin('enterMaxInvoices')}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="durationInDays" className="block text-sm font-medium text-gray-700 mb-1">
              {tAdmin('durationInDays')} *
            </label>
            <input
              type="number"
              id="durationInDays"
              name="durationInDays"
              value={formData.durationInDays}
              onChange={handleInputChange}
              placeholder={tAdmin('enterDuration')}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="eFacturaActive"
              name="eFacturaActive"
              checked={formData.eFacturaActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="eFacturaActive" className="ml-2 block text-sm text-gray-700">
              {tAdmin('eFacturaActive')}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={createMembershipTypeMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {createMembershipTypeMutation.isPending ? tCommon('loading') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
