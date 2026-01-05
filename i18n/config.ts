export const locales = ['en', 'ro'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ro'; // Romanian as default

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ro: 'Română',
};
