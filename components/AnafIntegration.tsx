'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useGetAnafStatus, useGetAnafAuthUrl } from '@/hooks/useAnaf';

interface AnafIntegrationProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function AnafIntegration({ onSuccess, onError }: AnafIntegrationProps) {
  const tAnaf = useTranslations('anaf');
  const { data: status, isLoading: isLoadingStatus, refetch } = useGetAnafStatus();
  const getAuthUrlMutation = useGetAnafAuthUrl();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Listen for messages from the OAuth popup window
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Check if the message is from ANAF auth callback
      if (event.data.type === 'ANAF_AUTH_SUCCESS') {
        setIsAuthenticating(false);

        // Refetch status to confirm token is saved
        await refetch();

        onSuccess?.(tAnaf('integrationSuccess'));
      } else if (event.data.type === 'ANAF_AUTH_ERROR') {
        setIsAuthenticating(false);

        const errorMessage = event.data.error || tAnaf('integrationFailed');
        onError?.(errorMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [refetch, onSuccess, onError, tAnaf]);

  const handleRegisterClick = async () => {
    try {
      setIsAuthenticating(true);
      const response = await getAuthUrlMutation.mutateAsync();

      // Open the ANAF auth URL in a new window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        response.authUrl,
        'anaf-auth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );
    } catch (error: any) {
      setIsAuthenticating(false);
      const errorMessage = error.response?.data?.message || tAnaf('authorizationFailed');
      onError?.(errorMessage);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-md">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span>{tAnaf('checkingStatus')}</span>
      </div>
    );
  }

  if (status?.isAuthorized) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-800 bg-green-50 border border-green-200 rounded-md">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{tAnaf('connected')}</span>
        </div>
        <button
          onClick={handleRegisterClick}
          disabled={isAuthenticating || getAuthUrlMutation.isPending}
          className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tAnaf('reauthorize')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRegisterClick}
      disabled={isAuthenticating || getAuthUrlMutation.isPending}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
    >
      {isAuthenticating || getAuthUrlMutation.isPending ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-white"
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
          <span>{tAnaf('opening')}</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{tAnaf('registerDigitalSign')}</span>
        </>
      )}
    </button>
  );
}
