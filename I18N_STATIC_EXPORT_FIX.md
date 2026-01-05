# i18n Static Export Fix

## Problem
The initial i18n setup used `cookies()` from Next.js, which is not compatible with `output: 'export'` (static site generation). This caused the error:

```
Route /companies with `dynamic = "error"` couldn't be rendered statically because it used `cookies()`
```

## Solution
Changed the i18n implementation to use **client-side localStorage** instead of server-side cookies, making it fully compatible with static exports.

## Changes Made

### 1. Updated `i18n/request.ts`
- Removed `cookies()` usage
- Always returns default locale (Romanian) on server
- Client-side handles actual locale switching

### 2. Created `components/I18nProvider.tsx`
- New client-side provider component
- Manages locale state with localStorage
- Listens for locale change events
- Dynamically loads translation files

### 3. Updated `components/LanguageSwitcher.tsx`
- Uses localStorage instead of cookies
- Dispatches custom events for instant updates
- No page reload needed!
- Handles hydration properly with mounted state

### 4. Updated `app/layout.tsx`
- Uses new `I18nProvider` instead of `NextIntlClientProvider` directly
- Removed `getLocale()` call (not compatible with static export)
- Passes initial messages to provider

### 5. Removed `middleware.ts`
- No longer needed for client-side approach
- Middleware requires server-side rendering

## Benefits of This Approach

✅ **Works with Static Export**: Fully compatible with `output: 'export'`
✅ **No Page Reload**: Translations update instantly when switching languages
✅ **Persistent**: Uses localStorage to remember user's language preference
✅ **Fast**: Client-side only, no server requests needed
✅ **Simple**: No middleware or complex routing needed

## How It Works

1. **Initial Load**: Server renders with default locale (Romanian) and messages
2. **Client Hydration**: `I18nProvider` checks localStorage for saved preference
3. **Language Switch**: User changes language → saves to localStorage → dispatches event → provider updates
4. **All components re-render** with new translations instantly

## Testing

To test the implementation:

1. Start the dev server: `npm run dev`
2. Open the app in browser
3. Use the language switcher to toggle between Romanian and English
4. Translations should update instantly without page reload
5. Refresh the page - your language preference should persist
6. Check browser DevTools → Application → Local Storage → `NEXT_LOCALE`

## Migration Notes

The usage in components remains **exactly the same**:

```tsx
const t = useTranslations('invoice');
{t('createInvoice')}
```

No changes needed to existing translation usage!
