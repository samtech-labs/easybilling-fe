# Internationalization (i18n) Guide for EasyBilling

This project uses `next-intl` for internationalization. Currently, **Romanian (ro)** is the default and only active language. The infrastructure supports adding more languages in the future if needed.

## Table of Contents
- [Quick Start](#quick-start)
- [How to Use Translations](#how-to-use-translations)
- [Adding New Translations](#adding-new-translations)
- [Language Switcher](#language-switcher)
- [File Structure](#file-structure)
- [Best Practices](#best-practices)

## Quick Start

### 1. In Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  // Get translations for a specific namespace
  const t = useTranslations('invoice');

  return (
    <div>
      <h1>{t('createInvoice')}</h1>
      <button>{t('downloadPdf')}</button>
    </div>
  );
}
```

### 2. In Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyServerComponent() {
  const t = await getTranslations('company');

  return (
    <div>
      <h1>{t('createCompany')}</h1>
    </div>
  );
}
```

### 3. Using Common Translations

```tsx
const t = useTranslations('common');

<button>{t('save')}</button>
<button>{t('cancel')}</button>
<button>{t('delete')}</button>
```

## How to Use Translations

### Basic Usage

```tsx
// Simple translation
{t('invoices')} // Output: "Facturi" (in Romanian)

// Nested keys using dot notation
const t = useTranslations();
{t('invoice.createInvoice')} // "Creează Factură Nouă"
```

### With Dynamic Values

```tsx
// For future implementation with variables:
{t('validation.minLength', { min: 5 })}
// In JSON: "minLength": "Lungimea minimă este de {min} caractere"
```

### Multiple Namespaces

```tsx
const tCommon = useTranslations('common');
const tInvoice = useTranslations('invoice');

<button>{tCommon('save')}</button>
<h1>{tInvoice('createInvoice')}</h1>
```

## Adding New Translations

### 1. Add to Translation Files

Update both `messages/en.json` and `messages/ro.json`:

**messages/en.json:**
```json
{
  "payment": {
    "methods": "Payment Methods",
    "cash": "Cash",
    "bankTransfer": "Bank Transfer",
    "selectMethod": "Select payment method"
  }
}
```

**messages/ro.json:**
```json
{
  "payment": {
    "methods": "Metode de Plată",
    "cash": "Numerar",
    "bankTransfer": "Transfer Bancar",
    "selectMethod": "Selectați metoda de plată"
  }
}
```

### 2. Use in Component

```tsx
const t = useTranslations('payment');

<select>
  <option value="">{t('selectMethod')}</option>
  <option value="cash">{t('cash')}</option>
  <option value="bank">{t('bankTransfer')}</option>
</select>
```

## Current Setup

The application is currently configured to use **Romanian only**. All UI text is translated to Romanian by default.

### Future Language Support

If you need to add English or other languages in the future:
1. The infrastructure is already in place (`messages/en.json` exists)
2. You would need to create a language switcher component
3. Update `I18nProvider.tsx` to support dynamic locale switching
4. All translation keys are already prepared in both Romanian and English

## File Structure

```
easybilling-fe/
├── messages/
│   ├── en.json          # English translations
│   └── ro.json          # Romanian translations
├── i18n/
│   ├── config.ts        # i18n configuration (locales, default)
│   └── request.ts       # Server-side i18n setup
├── components/
│   └── I18nProvider.tsx      # Client-side i18n provider
└── next.config.ts            # next-intl plugin configuration
```

## Best Practices

### 1. Organize by Feature/Domain

Group translations by feature or domain:
```json
{
  "invoice": { ... },
  "company": { ... },
  "client": { ... },
  "common": { ... }
}
```

### 2. Use Descriptive Keys

```json
// Good ✅
"createNewInvoice": "Create New Invoice"
"downloadPdfFile": "Download PDF"

// Bad ❌
"btn1": "Create"
"text": "Download"
```

### 3. Keep Common Strings in 'common' Namespace

```json
{
  "common": {
    "save": "Salvează",
    "cancel": "Anulează",
    "delete": "Șterge",
    "loading": "Se încarcă"
  }
}
```

### 4. Always Update Both Language Files

When adding a new key, update BOTH `en.json` and `ro.json` to avoid missing translations.

### 5. Use TypeScript for Type Safety

```tsx
// TypeScript will autocomplete available keys
const t = useTranslations('invoice');
t('createInvoice'); // ✅ Autocompleted
t('nonExistentKey'); // ❌ TypeScript error
```

## Example: Converting Existing Component

### Before (Without i18n)
```tsx
export default function CreateCompanyModal() {
  return (
    <div>
      <h3>Create Company</h3>
      <label>Company Name</label>
      <input placeholder="Enter company name" />
      <button>Save</button>
      <button>Cancel</button>
    </div>
  );
}
```

### After (With i18n)
```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function CreateCompanyModal() {
  const t = useTranslations('company');
  const tCommon = useTranslations('common');

  return (
    <div>
      <h3>{t('createCompany')}</h3>
      <label>{t('companyName')}</label>
      <input placeholder={t('companyName')} />
      <button>{tCommon('save')}</button>
      <button>{tCommon('cancel')}</button>
    </div>
  );
}
```

## Testing Translations

### 1. Switch Language
Use the language switcher in the navbar to switch between English and Romanian.

### 2. Verify Cookie
Open browser DevTools → Application → Cookies → check for `NEXT_LOCALE` cookie.

### 3. Check All Pages
Navigate through all pages to ensure translations are applied correctly.

## Troubleshooting

### Translations Not Updating
- Clear browser localStorage (`NEXT_LOCALE`)
- Hard refresh the page (Ctrl+Shift+R)
- Restart the development server
- Check browser console for errors

### Missing Translation Keys
- Check both `en.json` and `ro.json` have the same structure
- Verify the namespace and key names are correct
- Look for typos in translation keys

### TypeScript Errors
- Restart TypeScript server in your IDE
- Make sure `messages/*.json` files are valid JSON

## Current Translation Coverage

The following areas have translations ready:

✅ Common terms (save, cancel, delete, etc.)
✅ Navigation (navbar)
✅ Company management
✅ Client management
✅ Invoice management
✅ ANAF integration terms
✅ Validation messages
✅ Error messages

## Next Steps

To fully translate the application:

1. Add `LanguageSwitcher` to the Navbar component
2. Update each component to use `useTranslations()`
3. Replace hardcoded strings with translation keys
4. Test thoroughly in both languages
5. Add more specific translations as needed

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
