'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useUpdateUser } from '@/hooks/useAdmin';
import { UpdateUserRequest, UserResponseDto, UserRole } from '@/types/user';
import { X } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponseDto;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState<UpdateUserRequest>({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        password: '',
      });
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, user]);

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
    if (formData.username && formData.username.length < 3) {
      setErrorMessage(tAdmin('minUsernameLength'));
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMessage(tAdmin('minPasswordLength'));
      return;
    }

    try {
      // Only send fields that have values
      const updateData: UpdateUserRequest = {
        id: formData.id,
      };

      if (formData.username && formData.username !== user.username) {
        updateData.username = formData.username;
      }
      if (formData.email && formData.email !== user.email) {
        updateData.email = formData.email;
      }
      if (formData.role && formData.role !== user.role) {
        updateData.role = formData.role;
      }
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }

      await updateUserMutation.mutateAsync(updateData);
      setSuccessMessage(tAdmin('userUpdatedSuccess'));

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || tAdmin('userUpdatedError')
      );
    }
  };

  const handleClose = () => {
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      password: '',
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
          <h3 className="text-xl font-bold text-gray-900">{tAdmin('editUser')}</h3>
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
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {tAdmin('username')}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={tAdmin('enterUsername')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {tAdmin('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={tAdmin('enterEmail')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {tAdmin('password')} <span className="text-gray-500 text-xs">({tCommon('optional')})</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={tAdmin('enterPassword')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Lăsați gol pentru a păstra parola actuală</p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                {tAdmin('role')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={UserRole.USER}>{tAdmin('roles.USER')}</option>
                <option value={UserRole.ACCOUNTANT}>{tAdmin('roles.ACCOUNTANT')}</option>
                <option value={UserRole.ADMIN}>{tAdmin('roles.ADMIN')}</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateUserMutation.isPending ? tCommon('loading') : tCommon('save')}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
