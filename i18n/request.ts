import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './config';

export default getRequestConfig(async () => {
  // For static export, always use default locale on server
  // Client-side locale switching will be handled by the provider
  const locale = defaultLocale;

  return {
    locale,
    timeZone: 'Europe/Bucharest',
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
