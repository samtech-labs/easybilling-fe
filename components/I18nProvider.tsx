'use client';

import { NextIntlClientProvider } from 'next-intl';
import { defaultLocale } from '@/i18n/config';

interface I18nProviderProps {
  children: React.ReactNode;
  initialMessages: any;
}

export default function I18nProvider({ children, initialMessages }: I18nProviderProps) {
  // Always use Romanian (default locale)
  return (
    <NextIntlClientProvider locale={defaultLocale} messages={initialMessages} timeZone="Europe/Bucharest">
      {children}
    </NextIntlClientProvider>
  );
}
