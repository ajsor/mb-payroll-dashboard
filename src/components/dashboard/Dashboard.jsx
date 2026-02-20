import React, { useState } from 'react';
// Modern dashboard with top toolbar
import TopToolbar from './TopToolbar';
import DateRangeFilter from './DateRangeFilter';
import InstructorFilter from './InstructorFilter';
import ServiceCategoryFilter from './ServiceCategoryFilter';
import ExportButtonHidden from './ExportButtonHidden';
import SummaryCardsSectionModern from './SummaryCardsSectionModern';
import ClientSummaryCards from './ClientSummaryCards';
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
// Client Dashboard Charts
import NewClientsByMonthChart from '../charts/NewClientsByMonthChart';
import NewClientsByCategoryChart from '../charts/NewClientsByCategoryChart';
import RetentionFunnelChart from '../charts/RetentionFunnelChart';
import ReferralSourceChart from '../charts/ReferralSourceChart';
import RetentionByReferralChart from '../charts/RetentionByReferralChart';
import RetentionByInstructorChart from '../charts/RetentionByInstructorChart';
import RetentionByClassChart from '../charts/RetentionByClassChart';
import RetentionByClassNameChart from '../charts/RetentionByClassNameChart';
import { usePayroll } from '../../context/PayrollContext';

const Dashboard = () => {
  const {
    payrollData,
    firstVisitData,
    logoPreviewUrl,
    resetApp,
    activeDashboard,
    hasPayrollData,
    hasFirstVisitData
  } = usePayroll();

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showInstructorFilter, setShowInstructorFilter] = useState(false);
  const [showServiceCategoryFilter, setShowServiceCategoryFilter] = useState(false);
  const [activeView, setActiveView] = useState('All');

  // Helper to check if a chart should be shown for the current view (Payroll Dashboard)
  const shouldShowPayrollChart = (chartCategories) => {
    if (activeView === 'All') return true;
    return chartCategories.includes(activeView);
  };

  // Helper to check if a chart should be shown for the current view (Client Dashboard)
  const shouldShowClientChart = (chartCategories) => {
    if (activeView === 'All') return true;
    return chartCategories.includes(activeView);
  };

  // Check if we have data for the active dashboard
  const hasDataForActiveDashboard =
    (activeDashboard === 'payroll' && hasPayrollData) ||
    (activeDashboard === 'client' && hasFirstVisitData);

  if (!hasDataForActiveDashboard) {
    const message = activeDashboard === 'payroll'
      ? 'Please upload a valid payroll Excel file to view the Payroll Dashboard.'
      : 'Please upload a valid First Visit Report to view the Client Dashboard.';

    return (
      <div className="dashboard-modern">
        <TopToolbar
          logo={logoPreviewUrl}
          onUploadClick={resetApp}
          showDateFilter={showDateFilter}
          setShowDateFilter={setShowDateFilter}
          showInstructorFilter={showInstructorFilter}
          setShowInstructorFilter={setShowInstructorFilter}
          showServiceCategoryFilter={showServiceCategoryFilter}
          setShowServiceCategoryFilter={setShowServiceCategoryFilter}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <div className="no-data">
          <h2>No Data Available</h2>
          <p>{message}</p>
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
        showServiceCategoryFilter={showServiceCategoryFilter}
        setShowServiceCategoryFilter={setShowServiceCategoryFilter}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Collapsible Filter Panels */}
      <div className={`filter-panel ${showDateFilter ? 'open' : ''}`}>
        <DateRangeFilter onApply={() => setShowDateFilter(false)} />
      </div>

      {activeDashboard === 'payroll' && (
        <div className={`filter-panel ${showInstructorFilter ? 'open' : ''}`}>
          <InstructorFilter onApply={() => setShowInstructorFilter(false)} />
        </div>
      )}

      {activeDashboard === 'client' && (
        <div className={`filter-panel ${showServiceCategoryFilter ? 'open' : ''}`}>
          <ServiceCategoryFilter onApply={() => setShowServiceCategoryFilter(false)} />
        </div>
      )}

      {/* Hidden export buttons for toolbar triggers */}
      <ExportButtonHidden />

      <div className="dashboard-content">
        {/* Payroll Dashboard */}
        {activeDashboard === 'payroll' && (
          <>
            <SummaryCardsSectionModern />

            <div className="charts-section">
              {/* Payroll Charts */}
              {shouldShowPayrollChart(['Payroll']) && <TopEarnersChart />}
              {shouldShowPayrollChart(['Payroll']) && <PayrollByMonthChart />}

              {/* Classes Charts */}
              {shouldShowPayrollChart(['Classes']) && <PopularClassesChart />}
              {shouldShowPayrollChart(['Classes']) && <AttendanceHeatmap />}
              {shouldShowPayrollChart(['Classes']) && <AttendanceTrendsChart />}
              {shouldShowPayrollChart(['Classes']) && <SessionsByMonthChart />}
              {shouldShowPayrollChart(['Classes']) && <ClassFrequencyChart />}

              {/* Instructors Charts */}
              {shouldShowPayrollChart(['Instructors']) && <TopAttendanceChart />}
              {shouldShowPayrollChart(['Instructors']) && <InstructorConsistencyChart />}
              {shouldShowPayrollChart(['Instructors']) && <InstructorWorkloadChart />}
              {shouldShowPayrollChart(['Instructors']) && <AttendanceGrowthChart />}
              {shouldShowPayrollChart(['Instructors']) && <InstructorComparisonChart />}

              {/* Insights Charts */}
              {shouldShowPayrollChart(['Insights']) && <YearOverYearChart />}
              {shouldShowPayrollChart(['Insights']) && <PeakHoursChart />}
              {shouldShowPayrollChart(['Insights']) && <UnderperformingClassesChart />}
            </div>
          </>
        )}

        {/* Client Dashboard */}
        {activeDashboard === 'client' && (
          <>
            <ClientSummaryCards />

            <div className="charts-section">
              {/* Acquisition Charts */}
              {shouldShowClientChart(['Acquisition']) && <NewClientsByMonthChart />}
              {shouldShowClientChart(['Acquisition']) && <NewClientsByCategoryChart />}

              {/* Retention Charts - 2 Column Grid Layout */}
              {shouldShowClientChart(['Retention']) && (
                <>
                  {/* Row 1: Client Retention (pie) | Retention by Class Type */}
                  <div className="charts-grid-row">
                    <RetentionFunnelChart />
                    <RetentionByClassChart />
                  </div>
                  {/* Row 2: Retention by Instructor (scrollable) | Retention by Class (scrollable) */}
                  <div className="charts-grid-row">
                    <RetentionByInstructorChart />
                    <RetentionByClassNameChart />
                  </div>
                </>
              )}

              {/* Referrals Charts */}
              {shouldShowClientChart(['Referrals']) && <ReferralSourceChart />}
              {shouldShowClientChart(['Referrals', 'Insights']) && <RetentionByReferralChart />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
