# MB Payroll Dashboard - Project Documentation

## Project Overview
A React-based payroll dashboard that processes multi-sheet Excel files and displays instructor earnings, class metrics, and visualizations with date range filtering.

## Current Status (January 25, 2026)

### Completed Features
- Multi-sheet Excel workbook support (handles 360+ sheets)
- Intelligent instructor section parsing (detects 'Total for [Name]' rows)
- Global terminology: 'Instructor' (not 'Employee')
- Date range extraction (from cell A2 or filename)
- Date range filtering with real-time updates
- File upload with drag-and-drop
- Three interactive charts (Bar, Pie, Line)
- Summary metrics cards
- Responsive design
- Context API state management

### Test Data Files
- Production: C:SeksePayroll Report 10-1-2019 - 1-25-2026.xls (360 sheets, 13,101 rows)
- Sample: C:Usersajs_oDownloadsSample Payroll Report 10-1-2019 - 1-25-2026.xlsx

## Key Implementation Details

### Excel Parsing (src/utils/excelParser.js)
Two-pass algorithm:
1. First pass: Find all 'Total for [Name]' sheets and map instructor sections
2. Second pass: Process all sheets with assigned instructor names

### State Management (src/context/PayrollContext.jsx)
- payrollData: Original unfiltered data
- filteredPayrollData: Filtered by date range (used by charts/metrics)
- dateFilter: { startDate, endDate }
- Real-time metric recalculation using useMemo

### File Structure
src/
├── context/PayrollContext.jsx (state management)
├── utils/excelParser.js (⭐ core parsing)
├── utils/dataProcessor.js (metrics calculation)
├── components/upload/ (file upload UI)
├── components/dashboard/ (dashboard + filters)
└── components/charts/ (3 chart components)

## Development

### Start Dev Server
\
> mb-payroll-dashboard@0.0.1 dev
> vite

Port 5173 is in use, trying another one...
Port 5174 is in use, trying another one...
Port 5175 is in use, trying another one...
Port 5176 is in use, trying another one...
Port 5177 is in use, trying another one...

  [32m[1mVITE[22m v5.4.21[39m  [2mready in [0m[1m839[22m[2m[0m ms[22m

  [32m➜[39m  [1mLocal[22m:   [36mhttp://localhost:[1m5178[22m/[39m
[2m  [32m➜[39m  [1mNetwork[22m[2m: use [22m[1m--host[22m[2m to expose[22m
### Testing
1. Upload Excel file (drag-and-drop or click)
2. Upload logo (optional)
3. Click 'Process Files'
4. Use date range filter
5. Check console for detailed parsing logs

## Future Enhancements to Consider
- Instructor-specific filtering
- Export data (CSV, Excel, PDF)
- Advanced filtering (by class, earnings range)
- Print-friendly view
- Multi-file comparison
- Historical trend analysis

## Technical Stack
- React 18 + Vite + **TypeScript**
- **React Router v7** (createBrowserRouter, lazy routes)
- **@stonecode/portal-sdk** — shared Supabase client, hash-token session bootstrap, portal launch URL builder
- Supabase Auth (storageKey `mb-auth` to avoid collision with other `*.stonecode.ai` apps)
- xlsx (SheetJS) - Excel parsing
- recharts - Charts
- react-dropzone - File uploads
- Context API - State management

## Changelog

### 2026-04-20 (3) - Bump GitHub Actions to v5 (Node 24 runtime)
- `.github/workflows/deploy.yml`: `actions/checkout@v4` to `@v5`, `actions/setup-node@v4` to `@v5`. Silences the Node.js 20 deprecation warning GitHub emits on every run. Node.js 20 support is being removed from the runner on 2026-09-16; v5 of these actions runs on Node.js 24.
- Build `node-version: '20'` unchanged — that's the build target, unrelated to the action runtime warning.

### 2026-04-20 (2) - Phase 4b-ii slice 2b: Tailwind for all 23 chart components
- Converted every chart component from `Dashboard.css` classes to Tailwind utilities via a shared `src/styles/chartClasses.js` constants module. Migrated: PayrollByMonth, SessionsByMonth, NewClientsByMonth, NewClientsByCategory, ReferralSource, AttendanceTrends, RetentionByClass, RetentionByClassName, RetentionByInstructor, RetentionByReferral, RetentionFunnel, TopEarners, TopAttendance, InstructorConsistency, PopularClasses, AttendanceGrowth, YearOverYear, UnderperformingClasses, InstructorWorkload, ClassFrequency, AttendanceHeatmap, InstructorComparison, PeakHours.
- `Dashboard.css` deleted entirely (from 827 lines to 0). Its survivors live in `src/index.css` now: global reset, body, `@keyframes dialogSlideIn`, and a minimal print rule. The `.app` class became `min-h-screen`. `.spin` became Tailwind's built-in `animate-spin`. `.charts-section` and `.charts-grid-row` became inline Tailwind grid utilities in `Dashboard.jsx`. No `import './styles/Dashboard.css'` remains.
- Build: CSS bundle 49 KB to 44 KB gzipped 8.2 KB. Build time ~5s.
- Dark mode preserved via the existing `body.dark-mode` JS toggle and `@custom-variant dark (&:where(body.dark-mode *, .dark, .dark *))` in index.css.

### 2026-04-20 - Phase 4b-ii slice 2a: Tailwind for upload + dashboard chrome
- Converted 12 chrome components from `Dashboard.css` classes to Tailwind utilities: `FileDropzone`, `FirstVisitDropzone`, `LogoDropzone`, `FileUploadContainer`, `Dashboard`, `TopToolbar`, `DateRangeFilter`, `InstructorFilter`, `ServiceCategoryFilter`, `SummaryCardsSectionModern`, `ClientSummaryCards`, `HelpDialog`. Visual parity preserved; indigo/violet palette unchanged.
- Dark mode kept on the existing `document.body.classList.toggle('dark-mode')` mechanism. `src/index.css` now declares `@custom-variant dark (&:where(body.dark-mode *, .dark, .dark *))` so both the dashboard (`body.dark-mode`) and the auth pages (`.dark` on `<html>`) light up Tailwind `dark:` utilities.
- `Dashboard.css` pruned from 2,396 to 827 lines. Removed all chrome rules no longer referenced by JSX (upload/dropzone/help-dialog/top-toolbar/filter-panel/summary-metrics/date-range-filter/instructor-filter/date-presets/header-actions/no-data/export-button/reset-button/dashboard-modern-etc) and their `body.dark-mode` overrides. Kept: `@keyframes spin`, `@keyframes dialogSlideIn`, global reset + `.app`, plus every chart class still used by the 23 chart components.
- Build size: CSS 53 KB to 49 KB.
- **Remaining for Phase 4b-ii (slice 2b):** migrate 23 chart components; strip final chart-specific rules from `Dashboard.css`.

### 2026-04-19 (4) - Phase 4b-ii slice 1: Tailwind for auth surface
- Installed Tailwind v4 (`tailwindcss@^4.1.18`, `@tailwindcss/vite@^4.1.18`) to match the stonecode.ai setup. `vite.config.ts` adds the `tailwindcss()` plugin; `src/index.css` starts with `@import "tailwindcss"` and declares the class-based dark variant (`@custom-variant dark`).
- Converted 5 auth/modal files from inline-style objects to Tailwind classes: `LoginPage`, `RegisterPage`, `AcceptInvitePage`, `InviteModal`, `ProtectedRoute`. Visual parity preserved.
- Dashboard.css / App.css untouched. Dashboard.css carries its own `* { margin: 0; padding: 0; }` reset, so Tailwind v4 Preflight is effectively a no-op for the dashboard surface.
- Build size: CSS 39 KB → 53 KB (+14 KB for utilities); per-page auth JS chunks shrunk by ~0.1–0.5 KB each with inline style objects removed.
- **Remaining for Phase 4b-ii:** migrate the dashboard surface itself (`Dashboard.css`, 2400 lines + ~15 components).

### 2026-04-19 (3) — Phase 4b-iii: Web Worker Excel parsing
- Moved the payroll Excel parser (300+ sheet workbooks) into a Web Worker so the UI thread stays responsive during upload. Before: the main thread would freeze for several seconds parsing the 360-sheet production file.
- `src/workers/excelParser.worker.ts` (new): self-contained, TS-typed port of the old `src/utils/excelParser.js`. Receives `File`, calls `file.arrayBuffer()` off-main-thread, runs the two-pass instructor-section parse, posts back `{ dateRange, payrollData, rowCount }`.
- `src/utils/parseExcelInWorker.ts` (new): thin wrapper exposing the same `parseExcelFile(file) → Promise<result>` surface as before, so `PayrollContext.jsx` only needed an import swap.
- Old `src/utils/excelParser.js` removed.
- Build output now splits the xlsx library into a 337 KB worker chunk loaded on-demand (main bundle unchanged — `firstVisitParser.js` and `ExportButtonHidden.jsx` still use xlsx on the main thread, but those operate on much smaller data).

### 2026-04-19 (2) — Phase 4b-i: App-scoped invitations
- Any signed-in MB Dashboard user can now invite others to MB Dashboard only (not the portal). Invite button added to `TopToolbar` (userPlus icon).
- `InviteModal` (new) collects email + optional personal note, calls `app-create-invitation` edge function. Handles both "invited" (token + email sent) and "granted_direct" (invitee already had a stonecode.ai account — flag granted, no signup needed) responses.
- `AcceptInvitePage` rewritten from stub: looks up the invitation by token, auto-accepts if the visitor is already signed in with the invited email, otherwise shows a signup form pre-filled with the invited email. Supabase email confirmation is supported via `emailRedirectTo` pointing back to `/accept-invite?token=…`.

### 2026-04-19
- **Phase 4a — Direct login + TypeScript conversion.** Project can now be logged into directly at `mb-dashboard.stonecode.ai/login` instead of only via portal deep-link.
- Migrated JS → TS: `main.jsx`, `App.jsx`, `supabase.js`, `AuthGate.jsx`, `vite.config.js` → `.tsx/.ts` equivalents. Added `tsconfig.json` + `tsconfig.node.json` with `allowJs: true` for gradual migration of remaining `.jsx` component files.
- Adopted `@stonecode/portal-sdk`: `supabase.ts` now uses `createPortalSupabaseClient({ storageKey: 'mb-auth' })`; auth context uses `bootstrapSessionFromHash()` for portal handoff
- Added React Router v7 with routes: `/login`, `/register`, `/accept-invite` (stub), `/app` (protected)
- `ProtectedRoute` replaces `AuthGate` — redirects to `/login?redirect=<url>` if unauthenticated, shows inline Access Denied if `mb_dashboard` flag is missing
- `LoginPage` supports both email+password and magic-link tabs; preserves `?redirect=<url>` param and forwards the freshly issued session to external URLs via `#access_token=…&refresh_token=…&type=portal` hash (same pattern used by portal→satellite handoff)
- `RegisterPage` notes that `mb_dashboard` flag still requires admin approval (until Phase 4b ships app-scoped invitations)
- `.gitignore` now ignores `.claude/` and `supabase/.temp/`
- **Not yet done (Phase 4b):** Tailwind migration, Web Worker Excel parsing, `mb_invitations` table, `InviteModal`, create/accept edge functions

## Notes for Next Session
Successfully parsing all 13,101 rows from 360 sheets with correct instructor names and date range filtering working perfectly.