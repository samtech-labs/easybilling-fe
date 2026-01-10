'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useAssignMembership, useGetMembershipTypes } from '@/hooks/useAdmin';
import { AssignMembershipRequest } from '@/types/membership';
import { UserResponseDto } from '@/types/user';
import { X } from 'lucide-react';

interface AssignMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponseDto;
}

export default function AssignMembershipModal({ isOpen, onClose, user }: AssignMembershipModalProps) {
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const { data: membershipTypes } = useGetMembershipTypes();

  const [formData, setFormData] = useState<AssignMembershipRequest>({
    userId: user.id,
    membershipTypeId: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const assignMembershipMutation = useAssignMembership();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!formData.membershipTypeId) {
      setErrorMessage(tAdmin('selectMembershipTypeRequired'));
      return;
    }

    try {
      // Convert the date to ISO format for the backend
      const requestData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString()
      };

      await assignMembershipMutation.mutateAsync(requestData);
      setSuccessMessage(tAdmin('membershipAssignedSuccess'));

      // Reset form and close modal after 1.5 seconds
      setTimeout(() => {
        setFormData({
          userId: user.id,
          membershipTypeId: '',
          startDate: new Date().toISOString().split('T')[0],
        });
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || tAdmin('membershipAssignedError')
      );
    }
  };

  const handleClose = () => {
    setFormData({
      userId: user.id,
      membershipTypeId: '',
      startDate: new Date().toISOString().split('T')[0],
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
          <div>
            <h3 className="text-xl font-bold text-gray-900">{tAdmin('assignMembershipToUser')}</h3>
            <p className="mt-1 text-sm text-gray-600">{user.username}</p>
          </div>
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
            <label htmlFor="membershipTypeId" className="block text-sm font-medium text-gray-700 mb-1">
              {tAdmin('membershipTypeName')} *
            </label>
            <select
              id="membershipTypeId"
              name="membershipTypeId"
              value={formData.membershipTypeId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{tAdmin('selectMembershipType')}</option>
              {membershipTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.price} RON ({type.maxInvoicesPerMonth} {tAdmin('invoices')}, {type.durationInDays} {tAdmin('days')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              {tAdmin('startDate')} *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
              disabled={assignMembershipMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {assignMembershipMutation.isPending ? tCommon('loading') : tAdmin('assignMembership')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
