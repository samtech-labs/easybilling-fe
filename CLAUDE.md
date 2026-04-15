# EasyBilling Frontend — CLAUDE.md

## Project Overview

Frontend for EasyBilling — a Romanian invoicing/billing SaaS application.
Communicates with the .NET backend API. Live at **easybilling.ro**.

---

## Build & Run Commands

```bash
# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Production build (static export)
npm run build

# Lint
npm run lint
```

**Note:** `output: 'export'` in `next.config.ts` — this is a fully static export (no SSR, no API routes).
All data fetching happens client-side via React Query + Axios.

---

## Tech Stack

| Category | Library | Version | Notes |
|----------|---------|---------|-------|
| Framework | Next.js | 16.1.0 | App Router, static export (`output: 'export'`) |
| React | React | 19.2.3 | Hooks pattern, no class components |
| Server state | TanStack React Query | 5.90.12 | `useQuery` / `useMutation` for all API calls |
| HTTP client | Axios | 1.13.2 | Centralized instance with JWT interceptors |
| Styling | Tailwind CSS | 4 | Utility-first, no component library |
| Icons | Lucide React | 0.562.0 | Installed but mostly inline SVG used currently |
| i18n | next-intl | 4.7.0 | Romanian (default) + English |
| Fonts | Geist Sans/Mono | — | Via `next/font` |

**Not currently used (despite being mentioned in backend CLAUDE.md):**
- No `react-hook-form` or `zod` — forms use vanilla `useState`
- No `shadcn/ui` or any component library
- No calendar library

---

## Architecture

### Folder Structure

```
app/                          ← Next.js App Router pages
  layout.tsx                  ← Root layout (Providers + Navbar)
  page.tsx                    ← Home/landing
  login/page.tsx              ← Login page
  companies/page.tsx          ← Company list + management
  invoices/page.tsx           ← Invoice list + management
  admin/                      ← Admin settings (config, user-config)
  billable-hours/             ← [NEW] Billable hours calendar + management
    page.tsx                  ← Monthly calendar grid
    templates/page.tsx        ← Email template editor per client
  invoices/batch/
    [batchId]/review/page.tsx ← [NEW] Batch approval page (SMS link target)

components/                   ← Reusable UI components
  Navbar.tsx                  ← Top navigation bar
  Toast.tsx / ToastContainer  ← Toast notification system
  Providers.tsx               ← QueryClient + Auth provider wrapper
  I18nProvider.tsx             ← i18n provider
  *Modal.tsx                  ← 15+ modal components (Create/Edit/Delete patterns)

hooks/                        ← Custom React hooks (React Query wrappers)
  useInvoices.ts              ← Invoice CRUD + PDF + eFactura
  useCompanies.ts             ← Company CRUD + ANAF integration
  useClients.ts               ← Client CRUD + ANAF lookup
  useAnaf.ts                  ← ANAF OAuth flow
  useAdmin.ts                 ← Admin operations
  useLogin.ts                 ← Authentication
  useToast.ts                 ← Toast notifications
  useBillableHours.ts         ← [NEW] Time entry CRUD + monthly timesheet
  useClientRates.ts           ← [NEW] Client rate management
  useEmailTemplates.ts        ← [NEW] Email template CRUD + preview
  useInvoiceBatches.ts        ← [NEW] Batch generation, approval, rejection

lib/
  api-client.ts               ← Axios instance with JWT Bearer interceptor

types/                        ← TypeScript interfaces (mirror backend DTOs)
  invoice.ts, client.ts, company.ts, user.ts, auth.ts,
  membership.ts, membershipType.ts
  billableHours.ts            ← [NEW] TimeEntry, MonthlyTimeSheet, ClientRate, etc.

contexts/
  AuthContext.tsx              ← JWT token + role management via React Context

i18n/
  config.ts                   ← Locale config (en, ro)
  request.ts                  ← next-intl request handler

messages/
  en.json                     ← English translations
  ro.json                     ← Romanian translations
```

### Key Patterns

**API calls:** Every API call goes through a React Query hook in `hooks/`. Hooks use the centralized
Axios instance from `lib/api-client.ts`. Never use raw `fetch` or direct Axios imports in components.

```typescript
// Pattern: hooks/useExample.ts
export const useGetThings = (companyId: string) => {
  return useQuery({
    queryKey: ['things', companyId],
    queryFn: async (): Promise<Thing[]> => {
      const response = await apiClient.get(`/things?companyId=${companyId}`);
      return response.data;
    },
    enabled: !!companyId,
  });
};

export const useCreateThing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateThingRequest) => {
      const response = await apiClient.post('/things', data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['things'] }),
  });
};
```

**Forms:** Vanilla React state with `useState`. No form library. Validation is basic client-side checks.

**Modals:** Fixed overlay pattern — `{isOpen && <div className="fixed inset-0 ...">}`. Each modal is its own
component file in `components/`.

**Authentication:** JWT token in `localStorage`. `AuthContext` provides `token`, `userRole`, `isAuthenticated`,
`logout`. The Axios interceptor auto-attaches the Bearer token to every request. 401 responses trigger
auto-logout + redirect to `/login`.

**Styling:** Tailwind utility classes only. Color palette: indigo (primary), gray (neutral), red (destructive).
Responsive: desktop tables with `hidden md:block`, mobile cards with `md:hidden`.

**i18n:** All user-facing strings go through `useTranslations` from `next-intl`. Keys organized by feature
in `messages/{locale}.json`.

---

## Auth & Routing

- All pages are client components (`'use client'`)
- Auth check on mount: if no token → redirect to `/login`
- Role extracted from JWT claim: `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`
- Company selection: `companyId` passed as URL query param (`?companyId={id}`)
- No middleware-based auth (static export doesn't support Next.js middleware)

---

## API Endpoints (Backend)

Base URL: `NEXT_PUBLIC_API_URL` (default `https://localhost:5001/api`)

### Existing

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/auth/login` | POST | Returns JWT token |
| `/auth/register` | POST | Creates user |
| `/company/*` | CRUD | Company management |
| `/client/*` | CRUD | Client management |
| `/invoice/CreateInvoice` | POST | Create invoice |
| `/invoice/GetAllInvoices?companyId` | GET | Paginated invoice list |
| `/invoice/GeneratePdf?invoiceId` | GET | Returns PDF blob |

### New (Billable Hours Feature)

| Endpoint | Method | Notes |
|----------|--------|-------|
| `/time-entries?companyId&month&year` | GET | Monthly timesheet + summaries |
| `/time-entries` | POST | Upsert time entry |
| `/time-entries/{id}` | DELETE | Delete entry |
| `/client-rates?clientId` | GET | Rate history |
| `/client-rates` | POST | Set new rate |
| `/client-rates/{id}` | DELETE | Remove rate |
| `/email-templates?clientId` | GET | Get template |
| `/email-templates` | POST | Create/update template |
| `/email-templates/preview` | POST | Render with sample data |
| `/invoice-batches?companyId` | GET | List batches |
| `/invoice-batches/{id}` | GET | Batch detail + drafts |
| `/invoice-batches/generate` | POST | Manual trigger |
| `/invoice-batches/{id}/approve` | POST | Approve & send |
| `/invoice-batches/{id}/reject` | POST | Cancel drafts |

---

## Development Conventions

- **All pages are client components** — static export means no server components for data fetching
- **TypeScript strict mode** — no `any` types
- **API calls only through hooks** — never raw Axios in components
- **Translations** — all user-facing strings in `messages/en.json` and `messages/ro.json`
- **Tailwind only** — no inline styles, no CSS modules
- **One modal = one file** — keep modals in `components/` as separate files
- **Query keys** — use descriptive arrays: `['invoices', companyId]`, `['time-entries', companyId, month, year]`
- **Error handling** — try/catch in mutation `onError`, display via Toast
- **Feature branches** off `main`; PRs for all changes

---

## Current Active Work

> **Update this section at the start of each session.**

### Billable Hours Feature (in progress)
- [ ] Types: `types/billableHours.ts` — TimeEntry, MonthlyTimeSheet, ClientMonthlySummary, ClientRate, EmailTemplate, InvoiceGenerationBatch
- [ ] Hooks: `useBillableHours.ts`, `useClientRates.ts`, `useEmailTemplates.ts`, `useInvoiceBatches.ts`
- [ ] Calendar grid component: monthly view, Mon–Fri columns, week rows, per-client hour entry, color-coded
- [ ] Billable hours page: `/billable-hours?companyId={id}` — calendar + summary panel + "Generate Invoices" button
- [ ] Client rate management: modal or inline UI for setting hourly rates per client
- [ ] Email template editor: `/billable-hours/templates?companyId={id}` — per-client subject/body/to/cc/bcc with placeholders
- [ ] Batch review page: `/invoices/batch/[batchId]/review` — approve/reject drafts (SMS link target)
- [ ] i18n: add billableHours, clientRates, emailTemplates, invoiceBatch keys to en.json + ro.json

### Existing work
- [ ] Invoice list filters (date range, status, series)
- [ ] Company settings — ANAF credentials connect/disconnect flow

---

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://easybilling.ro/api   # Backend API base URL
```

---

## Deployment

- **Build:** `npm run build` → static export to `out/` directory
- **Hosting:** Nginx on Hetzner VPS serves the static files
- **CI/CD:** Azure DevOps pipelines
- **Domain:** easybilling.ro via Cloudflare (DNS + proxy)
