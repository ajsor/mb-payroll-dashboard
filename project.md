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