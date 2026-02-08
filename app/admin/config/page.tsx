'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetUsers, useDeleteUser, useGetMembershipTypes, useDeleteMembershipType } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import CreateUserModal from '@/components/CreateUserModal';
import EditUserModal from '@/components/EditUserModal';
import CreateCompanyForUserModal from '@/components/CreateCompanyForUserModal';
import CreateMembershipTypeModal from '@/components/CreateMembershipTypeModal';
import AssignMembershipModal from '@/components/AssignMembershipModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { UserResponseDto } from '@/types/user';
import { MembershipTypeResponseDto } from '@/types/membershipType';
import { Users, Plus, Edit2, Trash2, Building2, CreditCard, Award } from 'lucide-react';

export default function AdminConfigPage() {
  const router = useRouter();
  const { isAuthenticated, logout, userRole } = useAuth();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const { data: users, isLoading, error } = useGetUsers();
  const { data: membershipTypes, isLoading: isLoadingMemberships, error: membershipError } = useGetMembershipTypes();
  const deleteUserMutation = useDeleteUser();
  const deleteMembershipTypeMutation = useDeleteMembershipType();
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [isCreateMembershipTypeModalOpen, setIsCreateMembershipTypeModalOpen] = useState(false);
  const [isAssignMembershipModalOpen, setIsAssignMembershipModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteMembershipModalOpen, setIsDeleteMembershipModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserResponseDto | null>(null);
  const [membershipTypeToDelete, setMembershipTypeToDelete] = useState<MembershipTypeResponseDto | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleEditClick = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleAssignCompanyClick = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsCreateCompanyModalOpen(true);
  };

  const handleAssignMembershipClick = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsAssignMembershipModalOpen(true);
  };

  const handleDeleteClick = (user: UserResponseDto) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleDeleteMembershipTypeClick = (membershipType: MembershipTypeResponseDto) => {
    setMembershipTypeToDelete(membershipType);
    setIsDeleteMembershipModalOpen(true);
  };

  const handleConfirmDeleteMembershipType = async () => {
    if (!membershipTypeToDelete) return;

    try {
      await deleteMembershipTypeMutation.mutateAsync(membershipTypeToDelete.id);
      setIsDeleteMembershipModalOpen(false);
      setMembershipTypeToDelete(null);
    } catch (error) {
      console.error('Failed to delete membership type:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (userRole && userRole !== 'ADMIN') {
      // Redirect non-admin users to home page
      router.push('/');
    }
  }, [isAuthenticated, userRole, router]);

  if (!isAuthenticated || (userRole && userRole !== 'ADMIN')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tAdmin('loadingUsers')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{tAdmin('errorLoadingUsers')}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            {tCommon('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{tAdmin('adminPanel')}</h1>
              <p className="mt-1 text-sm text-gray-600">{tAdmin('userManagement')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                {tAdmin('createUser')}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {tCommon('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Users Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-indigo-50 flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-medium text-gray-900">
              {tAdmin('users')} ({users?.length || 0})
            </h2>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tAdmin('username')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tAdmin('email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tAdmin('role')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tAdmin('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/admin/user-config?userId=${user.id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 cursor-pointer hover:underline"
                        >
                          {user.username}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'ACCOUNTANT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {tAdmin(`roles.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleAssignMembershipClick(user)}
                              className="text-orange-600 hover:text-orange-900"
                              title={tAdmin('assignMembership')}
                            >
                              <Award className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleAssignCompanyClick(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title={tAdmin('assignCompany')}
                          >
                            <Building2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title={tCommon('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-600 hover:text-red-900"
                            title={tCommon('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {tAdmin('noUsersFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <button
                        onClick={() => router.push(`/admin/user-config?userId=${user.id}`)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline text-left"
                      >
                        {user.username}
                      </button>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                      <span className={`inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'ACCOUNTANT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {tAdmin(`roles.${user.role}`)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleAssignMembershipClick(user)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        {tAdmin('assignMembership')}
                      </button>
                    )}
                    <button
                      onClick={() => handleAssignCompanyClick(user)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      {tAdmin('assignCompany')}
                    </button>
                    <button
                      onClick={() => handleEditClick(user)}
                      className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {tAdmin('noUsersFound')}
              </div>
            )}
          </div>
        </div>

        {/* Membership Types Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
          <div className="px-4 py-5 sm:px-6 bg-green-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-medium text-gray-900">
                {tAdmin('membershipTypes')} ({membershipTypes?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => setIsCreateMembershipTypeModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              {tAdmin('createMembershipType')}
            </button>
          </div>

          {isLoadingMemberships ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{tAdmin('loadingMembershipTypes')}</p>
            </div>
          ) : membershipError ? (
            <div className="p-8 text-center text-red-600">
              {tAdmin('errorLoadingMembershipTypes')}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('membershipTypeName')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('price')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('maxInvoicesPerMonth')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('eFacturaActive')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('durationInDays')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tAdmin('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {membershipTypes && membershipTypes.length > 0 ? (
                      membershipTypes.map((membership) => (
                        <tr key={membership.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                              {membership.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{membership.price} RON {tAdmin('perMonth')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{membership.maxInvoicesPerMonth} {tAdmin('invoices')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              membership.eFacturaActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {membership.eFacturaActive ? tAdmin('yes') : tAdmin('no')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{membership.durationInDays} {tAdmin('days')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteMembershipTypeClick(membership)}
                              className="text-red-600 hover:text-red-900"
                              title={tAdmin('deleteMembershipType')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          {tAdmin('noMembershipTypesFound')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {membershipTypes && membershipTypes.length > 0 ? (
                  membershipTypes.map((membership) => (
                    <div key={membership.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                            {membership.name}
                          </span>
                          <div className="mt-3 space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">{tAdmin('price')}:</span>{' '}
                              <span className="text-gray-900">{membership.price} RON {tAdmin('perMonth')}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">{tAdmin('maxInvoicesPerMonth')}:</span>{' '}
                              <span className="text-gray-900">{membership.maxInvoicesPerMonth} {tAdmin('invoices')}</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">{tAdmin('eFacturaActive')}:</span>{' '}
                              <span className={`inline-flex ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                membership.eFacturaActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {membership.eFacturaActive ? tAdmin('yes') : tAdmin('no')}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">{tAdmin('durationInDays')}:</span>{' '}
                              <span className="text-gray-900">{membership.durationInDays} {tAdmin('days')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleDeleteMembershipTypeClick(membership)}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {tCommon('delete')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {tAdmin('noMembershipTypesFound')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {selectedUser && (
        <CreateCompanyForUserModal
          isOpen={isCreateCompanyModalOpen}
          onClose={() => {
            setIsCreateCompanyModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {selectedUser && (
        <AssignMembershipModal
          isOpen={isAssignMembershipModalOpen}
          onClose={() => {
            setIsAssignMembershipModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {userToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title={tAdmin('deleteUser')}
          message={tAdmin('confirmDeleteUser')}
          isDeleting={deleteUserMutation.isPending}
        />
      )}

      <CreateMembershipTypeModal
        isOpen={isCreateMembershipTypeModalOpen}
        onClose={() => setIsCreateMembershipTypeModalOpen(false)}
      />

      {membershipTypeToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteMembershipModalOpen}
          onClose={() => {
            setIsDeleteMembershipModalOpen(false);
            setMembershipTypeToDelete(null);
          }}
          onConfirm={handleConfirmDeleteMembershipType}
          title={tAdmin('deleteMembershipType')}
          message={tAdmin('confirmDeleteMembershipType')}
          isDeleting={deleteMembershipTypeMutation.isPending}
        />
      )}
    </div>
  );
}
