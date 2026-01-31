# MB Payroll Dashboard - Project Documentation

## Current Status (January 30, 2026)

A modern React dashboard for visualizing MindBody payroll data with:
- Multi-sheet Excel support (360+ sheets, 13,101 rows)
- Intelligent instructor parsing from "Total for [Name]" sections
- Modern, sleek UI with shadcn/ui-inspired design
- Navigation views to filter charts by category
- Date range and instructor filtering
- 15 interactive charts with drill-down detail tables
- Export to Excel/CSV/PDF functionality
- Dark mode support
- Help dialog for new users

## Features

### Modern UI Design
- **Top Toolbar**: Compact navigation bar with logo, view tabs, filters, and actions
- **Navigation Views**: Filter charts by category (All, Payroll, Classes, Instructors, Insights)
- **Unified Metrics Card**: Full-width card displaying key metrics (Instructors, Classes, Sessions, Payroll)
- **Collapsible Filter Panels**: Date and instructor filters slide down from toolbar
- **Date Range Display**: Current filter shown in toolbar (e.g., "Jan 1, 2025 - Dec 31, 2025")
- **Modern Upload Screen**: Clean card-based design with drag & drop file upload
- **Help Dialog**: ? icon opens comprehensive feature guide

### Toolbar Icons
- Calendar icon - Filter by date range
- User icon - Filter by instructor
- Download icon - Export menu (Excel, CSV, PDF)
- Upload icon - Load new payroll file
- Sun/Moon icon - Toggle dark mode
- ? icon - Help dialog

### Filters & Export
- **Date Range Filter**: Start/End date pickers with quick presets
- **Date Presets**: This Year, Last Year, This Quarter, Last Quarter, This Month, Last Month, Last 90 Days, All Time
- **Instructor Filter**: Multi-select dropdown with Select All/Clear All
- **Default Exclusions**: "Front Desk" class automatically filtered out
- **Export Options**: Excel (multi-sheet), CSV, Print/PDF

### Export Functionality
- **Excel Export** - Multi-sheet workbook with:
  - Summary sheet (metrics and date range)
  - Detail Data sheet (all filtered rows)
  - By Instructor sheet (aggregated stats)
  - By Class sheet (aggregated stats)
- **CSV Export** - Simple data export of filtered rows
- **PDF Export** - Print-optimized view using browser print
- Filename includes date range

### Dark Mode
- Toggle in toolbar (sun/moon icon)
- Preference saved to localStorage
- Full theme support across all components

### Charts (15 Total)

#### Payroll View
1. **Top 10 Earners** - Bar chart showing instructors by total earnings with detail table
2. **Payroll by Month** - Bar chart of total payroll over time

#### Classes View
3. **Top 10 Most Popular Classes** - Bar chart by average attendance (40+ sessions filter)
4. **Average Attendance by Day & Time** - Heatmap (5 AM - 9 PM) with click-to-view sessions
5. **Attendance Trends** - Line chart showing monthly average attendance
6. **Sessions by Month** - Bar chart of session counts over time
7. **Class Frequency** - Horizontal bar chart showing ALL classes by session count (scrollable)

#### Instructors View
8. **Top 10 Instructors by Average Class Attendance** - Bar chart with click-to-view detail table
9. **Instructor Consistency** - Scatter chart showing average attendance vs consistency score
10. **Instructor Workload** - Horizontal bar chart showing ALL instructors by session count (scrollable)
11. **Attendance Growth/Decline** - Top 5 growing and declining instructors/classes
12. **Instructor Comparison** - Select 2-4 instructors to compare with radar chart

#### Insights View
13. **Year-over-Year Comparison** - Line chart comparing months across years
14. **Peak Hours Analysis** - Attendance by hour and day with scheduling recommendations
15. **Underperforming Classes** - Below average and declining classes analysis

### Detail Tables
- All drill-down tables have sortable columns (click headers)
- HTML entities decoded throughout (e.g., &#233; displays as é)

## Quick Start
```bash
cd C:\Users\ajs_o\mb-payroll-dashboard
npm run dev
# Opens at http://localhost:5179
```

## Project Structure

### Key Files
- `src/context/PayrollContext.jsx` - State management + filtering logic
- `src/components/shared/Icons.jsx` - Centralized SVG icon library
- `src/components/dashboard/Dashboard.jsx` - Main dashboard layout
- `src/components/dashboard/TopToolbar.jsx` - Navigation toolbar
- `src/components/dashboard/HelpDialog.jsx` - Help documentation dialog
- `src/components/dashboard/SummaryCardsSectionModern.jsx` - Metrics card
- `src/components/dashboard/DateRangeFilter.jsx` - Date filtering UI
- `src/components/dashboard/InstructorFilter.jsx` - Instructor filtering UI
- `src/components/upload/FileUploadContainer.jsx` - Upload screen
- `src/utils/excelParser.js` - Core two-pass parsing algorithm
- `src/utils/dataProcessor.js` - Metrics calculations
- `src/styles/Dashboard.css` - All styling including dark mode and print

### Chart Components (`src/components/charts/`)
- `TopAttendanceChart.jsx` - Top instructors by attendance
- `TopEarnersChart.jsx` - Top instructors by earnings
- `PopularClassesChart.jsx` - Most popular classes (40+ sessions)
- `AttendanceHeatmap.jsx` - Day/time heatmap
- `AttendanceTrendsChart.jsx` - Monthly attendance trends
- `SessionsByMonthChart.jsx` - Monthly session counts
- `PayrollByMonthChart.jsx` - Monthly payroll totals
- `YearOverYearChart.jsx` - Year-over-year comparison
- `InstructorConsistencyChart.jsx` - Instructor consistency scatter chart
- `InstructorWorkloadChart.jsx` - Full instructor workload (scrollable)
- `ClassFrequencyChart.jsx` - Full class frequency (scrollable)
- `AttendanceGrowthChart.jsx` - Growth/decline comparison
- `PeakHoursChart.jsx` - Peak hours analysis with recommendations
- `InstructorComparisonChart.jsx` - Side-by-side instructor comparison
- `UnderperformingClassesChart.jsx` - Underperforming classes analysis

## Completed Features
- [x] Multi-sheet Excel parsing
- [x] Modern UI with top toolbar navigation
- [x] Navigation views (All, Payroll, Classes, Instructors, Insights)
- [x] Unified metrics card
- [x] Date range filtering with presets
- [x] Date range display in toolbar
- [x] Instructor filtering
- [x] Default class exclusions (Front Desk)
- [x] 15 interactive charts
- [x] Sortable detail tables
- [x] Excel/CSV/PDF export
- [x] Year-over-year comparison
- [x] Dark mode with localStorage persistence
- [x] HTML entity decoding
- [x] Scrollable full-list charts
- [x] Peak hours analysis with recommendations
- [x] Instructor comparison tool
- [x] Underperforming classes identification
- [x] Help dialog
- [x] Modern upload screen
- [x] Centralized icon library
- [x] Code optimization pass

## Potential Future Enhancements
- Individual instructor report pages
- Email/scheduled report delivery
- Goal tracking and targets
- Mobile-responsive improvements
- Class filter (similar to instructor filter)
- Earnings per attendee analysis
- Left sidebar navigation

## Tech Stack
React 18, Vite, xlsx (SheetJS), Recharts, Context API

## Recent Optimization (January 30, 2026)
- Centralized 30+ SVG icons into shared Icons.jsx
- Removed 11 unused components
- Cleaned up ~150 lines of legacy CSS
- Improved code maintainability
