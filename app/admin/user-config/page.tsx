'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useGetUserById,
  useGetMembershipsByUserId,
  useDeleteMembership,
  useGetCompaniesForUser,
  useDeleteCompanyForUser,
} from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import AssignMembershipModal from '@/components/AssignMembershipModal';
import CreateCompanyForUserModal from '@/components/CreateCompanyForUserModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Building2, CreditCard, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function UserConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const { isAuthenticated, userRole } = useAuth();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tCompany = useTranslations('company');

  const { data: user, isLoading: isLoadingUser } = useGetUserById(userId);
  const { data: memberships, isLoading: isLoadingMemberships } = useGetMembershipsByUserId(userId);
  const { data: userCompanies, isLoading: isLoadingCompanies } = useGetCompaniesForUser(userId);
  const deleteMembershipMutation = useDeleteMembership();
  const deleteCompanyMutation = useDeleteCompanyForUser();

  const [isAssignMembershipModalOpen, setIsAssignMembershipModalOpen] = useState(false);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [isDeleteMembershipModalOpen, setIsDeleteMembershipModalOpen] = useState(false);
  const [isDeleteCompanyModalOpen, setIsDeleteCompanyModalOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState<any>(null);
  const [companyToDelete, setCompanyToDelete] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (userRole && userRole !== 'ADMIN') {
      router.push('/');
    } else if (!userId) {
      router.push('/admin/config');
    }
  }, [isAuthenticated, userRole, userId, router]);

  const handleDeleteMembershipClick = (membership: any) => {
    setMembershipToDelete(membership);
    setIsDeleteMembershipModalOpen(true);
  };

  const handleConfirmDeleteMembership = async () => {
    if (!membershipToDelete) return;

    try {
      await deleteMembershipMutation.mutateAsync(membershipToDelete.id);
      setIsDeleteMembershipModalOpen(false);
      setMembershipToDelete(null);
    } catch (error) {
      console.error('Failed to delete membership:', error);
    }
  };

  const handleDeleteCompanyClick = (company: any) => {
    setCompanyToDelete(company);
    setIsDeleteCompanyModalOpen(true);
  };

  const handleConfirmDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      await deleteCompanyMutation.mutateAsync({
        companyId: companyToDelete.id,
        userId: userId
      });
      setIsDeleteCompanyModalOpen(false);
      setCompanyToDelete(null);
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  const handleBack = () => {
    router.push('/admin/config');
  };

  if (!isAuthenticated || (userRole && userRole !== 'ADMIN')) {
    return null;
  }

  if (!userId) {
    return null;
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{tAdmin('errorLoadingUsers')}</p>
          <button
            onClick={handleBack}
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
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {tAdmin('userDetails')}: {user.username}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {user.email} • {tAdmin(`roles.${user.role}`)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Companies Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">
                {tAdmin('userCompanies')} ({userCompanies?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => setIsCreateCompanyModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              {tAdmin('assignCompany')}
            </button>
          </div>

          {isLoadingCompanies ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tCompany('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CUI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tCompany('city')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tAdmin('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userCompanies && userCompanies.length > 0 ? (
                    userCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{company.cui}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{company.city || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteCompanyClick(company)}
                            className="text-red-600 hover:text-red-900"
                            title={tCommon('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        {tAdmin('noCompaniesAssigned')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Memberships Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-green-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-medium text-gray-900">
                {tAdmin('membershipTypes')} ({memberships?.length || 0})
              </h2>
            </div>
            <button
              onClick={() => setIsAssignMembershipModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              {tAdmin('assignMembership')}
            </button>
          </div>

          {isLoadingMemberships ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tAdmin('membershipTypeName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tAdmin('startDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tAdmin('endDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tAdmin('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberships && memberships.length > 0 ? (
                    memberships.map((membership) => (
                      <tr key={membership.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{membership.membershipTypeName}</div>
                          <div className="text-sm text-gray-500">
                            {membership.price} RON • {membership.maxInvoicesPerMonth} {tAdmin('invoices')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(membership.startDate).toLocaleDateString('ro-RO')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(membership.endDate).toLocaleDateString('ro-RO')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            membership.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {membership.isActive ? tAdmin('activeMembership') : 'Expirat'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteMembershipClick(membership)}
                            className="text-red-600 hover:text-red-900"
                            title={tCommon('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        {tAdmin('noActiveMembership')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {user && (
        <AssignMembershipModal
          isOpen={isAssignMembershipModalOpen}
          onClose={() => setIsAssignMembershipModalOpen(false)}
          user={user}
        />
      )}

      {user && (
        <CreateCompanyForUserModal
          isOpen={isCreateCompanyModalOpen}
          onClose={() => setIsCreateCompanyModalOpen(false)}
          user={user}
        />
      )}

      {membershipToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteMembershipModalOpen}
          onClose={() => {
            setIsDeleteMembershipModalOpen(false);
            setMembershipToDelete(null);
          }}
          onConfirm={handleConfirmDeleteMembership}
          title={tCommon('delete')}
          message={tAdmin('confirmDeleteMembershipType')}
          isDeleting={deleteMembershipMutation.isPending}
        />
      )}

      {companyToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteCompanyModalOpen}
          onClose={() => {
            setIsDeleteCompanyModalOpen(false);
            setCompanyToDelete(null);
          }}
          onConfirm={handleConfirmDeleteCompany}
          title={tCommon('delete')}
          message={tCompany('confirmDeleteCompany')}
          isDeleting={deleteCompanyMutation.isPending}
        />
      )}
    </div>
  );
}
