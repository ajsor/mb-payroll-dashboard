# MB Payroll Dashboard - Project Context

## Overview
A React dashboard for visualizing MindBody payroll report data. Parses multi-sheet Excel files containing instructor payment and class attendance data, presenting insights through interactive charts.

## Tech Stack
- **Framework:** React 18 with Vite
- **Charts:** Recharts
- **State Management:** Context API (PayrollContext)
- **Excel Parsing:** xlsx (SheetJS)
- **Styling:** Plain CSS (no CSS-in-JS or Tailwind)

## Project Structure
```
src/
├── components/
│   ├── charts/          # 15 chart components (Recharts-based)
│   ├── dashboard/       # Dashboard layout, toolbar, filters, dialogs
│   ├── shared/          # Shared components (Icons.jsx)
│   └── upload/          # File upload components
├── context/
│   └── PayrollContext.jsx  # Central state management
├── styles/
│   └── Dashboard.css    # All styles including dark mode
└── utils/
    ├── excelParser.js   # Two-pass Excel parsing algorithm
    ├── dataProcessor.js # Metrics calculations
    └── validators.js    # File validation
```

## Key Patterns

### Icons
All SVG icons are centralized in `src/components/shared/Icons.jsx`. Import as:
```jsx
import { Icons, SmallIcons } from '../shared/Icons';
// Usage: {Icons.calendar}
```

### State Management
PayrollContext provides:
- `payrollData` - Raw parsed data
- `filteredPayrollData` - Data after filters applied (use this for charts)
- `dateFilter`, `setDateFilter` - Date range filter state
- `instructorFilter`, `setInstructorFilter` - Instructor filter state
- `metrics` - Computed summary metrics

### Default Exclusions
"Front Desk" class is automatically excluded in PayrollContext. Add other exclusions to `excludedClasses` array if needed.

### Chart Categories
Charts are organized into views in Dashboard.jsx:
- **Payroll:** TopEarnersChart, PayrollByMonthChart
- **Classes:** PopularClassesChart, AttendanceHeatmap, AttendanceTrendsChart, SessionsByMonthChart, ClassFrequencyChart
- **Instructors:** TopAttendanceChart, InstructorConsistencyChart, InstructorWorkloadChart, AttendanceGrowthChart, InstructorComparisonChart
- **Insights:** YearOverYearChart, PeakHoursChart, UnderperformingClassesChart

### HTML Entity Decoding
Instructor/class names may contain HTML entities (e.g., `&#233;`). Use the `decodeHtmlEntities` helper in chart components:
```jsx
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};
```

## Styling Conventions
- Use CSS classes in Dashboard.css
- Follow existing naming: `.component-name`, `.component-name-element`
- Dark mode: prefix with `body.dark-mode .component-name`
- Colors: Primary indigo (#6366f1), success green (#10b981), borders (#e5e7eb)

## Data Structure
Each payroll row contains:
- `instructorName` - Instructor's name
- `className` - Class/service name
- `classDate` - Date of class (string)
- `classTime` - Time of class
- `staffPaid` - Attendance count
- `earnings` - Payment amount

## Running the Project
```bash
npm run dev  # Starts at http://localhost:5179
```

## GitHub Repository
https://github.com/ajsor/mb-payroll-dashboard
