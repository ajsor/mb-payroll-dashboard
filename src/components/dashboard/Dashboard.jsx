import React, { useState } from 'react';
// Modern dashboard with top toolbar
import TopToolbar from './TopToolbar';
import DateRangeFilter from './DateRangeFilter';
import InstructorFilter from './InstructorFilter';
import ExportButtonHidden from './ExportButtonHidden';
import SummaryCardsSectionModern from './SummaryCardsSectionModern';
import TopAttendanceChart from '../charts/TopAttendanceChart';
import TopEarnersChart from '../charts/TopEarnersChart';
import PopularClassesChart from '../charts/PopularClassesChart';
import AttendanceHeatmap from '../charts/AttendanceHeatmap';
import AttendanceTrendsChart from '../charts/AttendanceTrendsChart';
import SessionsByMonthChart from '../charts/SessionsByMonthChart';
import PayrollByMonthChart from '../charts/PayrollByMonthChart';
import YearOverYearChart from '../charts/YearOverYearChart';
import InstructorConsistencyChart from '../charts/InstructorConsistencyChart';
import InstructorWorkloadChart from '../charts/InstructorWorkloadChart';
import ClassFrequencyChart from '../charts/ClassFrequencyChart';
import AttendanceGrowthChart from '../charts/AttendanceGrowthChart';
import PeakHoursChart from '../charts/PeakHoursChart';
import InstructorComparisonChart from '../charts/InstructorComparisonChart';
import UnderperformingClassesChart from '../charts/UnderperformingClassesChart';
import { usePayroll } from '../../context/PayrollContext';

const Dashboard = () => {
  const { payrollData, logoPreviewUrl, resetApp } = usePayroll();
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showInstructorFilter, setShowInstructorFilter] = useState(false);
  const [activeView, setActiveView] = useState('All');

  // Helper to check if a chart should be shown for the current view
  const shouldShowChart = (chartCategories) => {
    if (activeView === 'All') return true;
    return chartCategories.includes(activeView);
  };

  if (!payrollData || payrollData.length === 0) {
    return (
      <div className="dashboard-modern">
        <div className="no-data">
          <h2>No Data Available</h2>
          <p>Please upload a valid payroll Excel file to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      <TopToolbar
        logo={logoPreviewUrl}
        onUploadClick={resetApp}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
        showInstructorFilter={showInstructorFilter}
        setShowInstructorFilter={setShowInstructorFilter}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Collapsible Filter Panels */}
      <div className={`filter-panel ${showDateFilter ? 'open' : ''}`}>
        <DateRangeFilter onApply={() => setShowDateFilter(false)} />
      </div>

      <div className={`filter-panel ${showInstructorFilter ? 'open' : ''}`}>
        <InstructorFilter onApply={() => setShowInstructorFilter(false)} />
      </div>

      {/* Hidden export buttons for toolbar triggers */}
      <ExportButtonHidden />

      <div className="dashboard-content">
        <SummaryCardsSectionModern />

        <div className="charts-section">
          {/* Payroll Charts */}
          {shouldShowChart(['Payroll']) && <TopEarnersChart />}
          {shouldShowChart(['Payroll']) && <PayrollByMonthChart />}

          {/* Classes Charts */}
          {shouldShowChart(['Classes']) && <PopularClassesChart />}
          {shouldShowChart(['Classes']) && <AttendanceHeatmap />}
          {shouldShowChart(['Classes']) && <AttendanceTrendsChart />}
          {shouldShowChart(['Classes']) && <SessionsByMonthChart />}
          {shouldShowChart(['Classes']) && <ClassFrequencyChart />}

          {/* Instructors Charts */}
          {shouldShowChart(['Instructors']) && <TopAttendanceChart />}
          {shouldShowChart(['Instructors']) && <InstructorConsistencyChart />}
          {shouldShowChart(['Instructors']) && <InstructorWorkloadChart />}
          {shouldShowChart(['Instructors']) && <AttendanceGrowthChart />}
          {shouldShowChart(['Instructors']) && <InstructorComparisonChart />}

          {/* Insights Charts */}
          {shouldShowChart(['Insights']) && <YearOverYearChart />}
          {shouldShowChart(['Insights']) && <PeakHoursChart />}
          {shouldShowChart(['Insights']) && <UnderperformingClassesChart />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
