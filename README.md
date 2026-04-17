# ERP Proof of Concept

A browser-only Enterprise Resource Planning proof-of-concept built with Vue 3, Pinia, and TypeScript. All data is generated on first load, persisted in the browser via `localStorage`, and can be reset from the Settings module at any time.

The POC is intentionally generic: it uses `Demo Company` as the host organization and customer names such as `Customer A`, `Customer B`, and `Customer C`. It is designed to be cloned, rebranded, and demoed with no backend or network calls.

## Tech Stack

| Layer            | Choice                                           |
| ---------------- | ------------------------------------------------ |
| Framework        | Vue 3 (Composition API, `<script setup>`)        |
| Build            | Vite 6                                           |
| Language         | TypeScript (strict mode)                         |
| State            | Pinia                                            |
| Routing          | Vue Router 4 (hash history)                      |
| Styling          | Tailwind CSS 3 (class-based dark mode)           |
| Charts           | Chart.js + vue-chartjs                           |
| Icons            | lucide-vue-next                                  |
| Tables / Excel   | SheetJS (`xlsx`) for template, preview, and export |
| PDF              | jspdf + jspdf-autotable for approval letters    |
| Dates            | date-fns                                         |
| IDs              | uuid                                             |

## Quick Start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
npm run preview   # serve the production bundle
```

Login with any of the seeded users (password is the email local-part, i.e. everything before `@`):

| Role               | Email                         | Password    |
| ------------------ | ----------------------------- | ----------- |
| Admin              | admin@demo.co                 | admin       |
| Sales              | sales@demo.co                 | sales       |
| Area Manager       | area.manager@demo.co          | area.manager |
| Regional Manager   | regional.manager@demo.co      | regional.manager |
| Finance Director   | finance.director@demo.co      | finance.director |

You can also switch roles on the fly from the role switcher in the topbar. This is a demo convenience and is not part of a real-world auth flow.

## Feature Map

### Priority Features

1. Field Sales Excel Upload (`Sales Data → Field Upload`)
   - Drag-and-drop, template download, column-mapping preview
   - Row-level validation with inline error highlighting
   - Persisted upload history with audit trail and per-upload rollback
2. Integrated Sales Dashboard (`Sales Data → Analytics`)
   - Unified offline (field) and online (marketplace) data model
   - Date-range + channel + marketplace filters
   - Trend, stacked revenue, rep leaderboard, doughnut breakdowns
3. Promo Submission and Approval Workflow (`Promos`)
   - Submission wizard (Basics → Timing → Financials → Justification)
   - Status machine: `Submitted → Pending Area → Pending Regional → Pending Finance → Approved` (or `Rejected` at any tier)
   - Role-based approvers with audit log and PDF approval letter
4. Vendor Proposal (`Vendor Proposal`)
   - Five-section static proposal: Company Profile, Portfolio, Solution, Cost Estimate, Timeline

### Standard Modules

- Dashboard, Sales (Quotes / Orders / Invoices / Customers), CRM, Projects, Reports, Settings — fully implemented
- Purchasing, Inventory, Accounting, HR, Manufacturing — Phase 2 read-only views flagged with a `Phase 2 — Roadmap` badge on the page header

## Project Structure

```
src/
├── components/     # base UI, charts, shared domain widgets, layout chrome
├── composables/    # useStorage, useExcel, usePdf, useFormat, useToast, useConfirm
├── data/           # deterministic seeders (PRNG-based)
├── layouts/        # AuthLayout, MainLayout, ProposalLayout
├── router/         # routes + navigation guards
├── stores/         # Pinia stores (one per domain)
├── types/          # shared TypeScript definitions
└── views/          # one folder per module
```

## Data Lifecycle

- All stores load from `localStorage` on first access and auto-persist on write via the `useStorage<T>` composable
- The initial seed runs once per `seedVersion`; bumping the version in `src/data/seed.ts` triggers a re-seed on next page load
- `Settings → Data → Reset Demo Data` clears all storage keys and reloads the app

## Limitations

- No network / backend: no real auth, authorization is role-based and trusted client-side
- Phase 2 modules show representative read-only data — no editing, no workflows
- Excel parsing is client-side only; large files (>50k rows) are not tuned for streaming
- The PDF approval letter uses a static letterhead ("Demo Company") and is intended as a visual artifact only

## Scripts

| Script             | Purpose                            |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start Vite dev server              |
| `npm run build`    | `vue-tsc --noEmit` then `vite build` |
| `npm run preview`  | Serve the built bundle             |
| `npm run type-check` | Run the strict type checker only |

## Deployment

The project ships with a `vercel.json` and is ready to deploy to Vercel with zero configuration.

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/radinaldhs/erp-poc)

### Manual deploy

```bash
npm i -g vercel
vercel                 # link the project on first run
vercel --prod          # deploy to production
```

Vercel automatically detects the Vite framework, runs `npm install` + `npm run build`, and serves `dist/`. The included `vercel.json` adds:

- SPA rewrites so every path falls back to `index.html`
- Immutable caching for hashed assets under `/assets/*`
- No-cache on `index.html` so new deploys are picked up immediately

No environment variables or backend services are required — the app is fully client-side.
