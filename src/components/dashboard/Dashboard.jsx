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

  const shouldShowPayrollChart = (chartCategories) => {
    if (activeView === 'All') return true;
    return chartCategories.includes(activeView);
  };

  const shouldShowClientChart = (chartCategories) => {
    if (activeView === 'All') return true;
    return chartCategories.includes(activeView);
  };

  const hasDataForActiveDashboard =
    (activeDashboard === 'payroll' && hasPayrollData) ||
    (activeDashboard === 'client' && hasFirstVisitData);

  const panelBase = 'overflow-hidden bg-white transition-[max-height,padding] duration-300 border-b border-transparent dark:bg-slate-800';
  const panelOpen = 'max-h-[400px] border-b-gray-200 dark:border-b-slate-700';
  const panelClosed = 'max-h-0';

  if (!hasDataForActiveDashboard) {
    const message = activeDashboard === 'payroll'
      ? 'Please upload a valid payroll Excel file to view the Payroll Dashboard.'
      : 'Please upload a valid First Visit Report to view the Client Dashboard.';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
        <div className="text-center px-8 py-16">
          <h2 className="text-[2rem] text-gray-800 mb-4 dark:text-slate-100">No Data Available</h2>
          <p className="text-[1.1rem] text-gray-500 dark:text-slate-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
      <div className={`${panelBase} ${showDateFilter ? panelOpen : panelClosed}`}>
        <DateRangeFilter onApply={() => setShowDateFilter(false)} />
      </div>

      {activeDashboard === 'payroll' && (
        <div className={`${panelBase} ${showInstructorFilter ? panelOpen : panelClosed}`}>
          <InstructorFilter onApply={() => setShowInstructorFilter(false)} />
        </div>
      )}

      {activeDashboard === 'client' && (
        <div className={`${panelBase} ${showServiceCategoryFilter ? panelOpen : panelClosed}`}>
          <ServiceCategoryFilter onApply={() => setShowServiceCategoryFilter(false)} />
        </div>
      )}

      {/* Hidden export buttons for toolbar triggers */}
      <ExportButtonHidden />

      <div className="max-w-[1600px] mx-auto px-8 pt-6 pb-8">
        {/* Payroll Dashboard */}
        {activeDashboard === 'payroll' && (
          <>
            <SummaryCardsSectionModern />

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(500px,1fr))] gap-8">
              {shouldShowPayrollChart(['Payroll']) && <TopEarnersChart />}
              {shouldShowPayrollChart(['Payroll']) && <PayrollByMonthChart />}

              {shouldShowPayrollChart(['Classes']) && <PopularClassesChart />}
              {shouldShowPayrollChart(['Classes']) && <AttendanceHeatmap />}
              {shouldShowPayrollChart(['Classes']) && <AttendanceTrendsChart />}
              {shouldShowPayrollChart(['Classes']) && <SessionsByMonthChart />}
              {shouldShowPayrollChart(['Classes']) && <ClassFrequencyChart />}

              {shouldShowPayrollChart(['Instructors']) && <TopAttendanceChart />}
              {shouldShowPayrollChart(['Instructors']) && <InstructorConsistencyChart />}
              {shouldShowPayrollChart(['Instructors']) && <InstructorWorkloadChart />}
              {shouldShowPayrollChart(['Instructors']) && <AttendanceGrowthChart />}
              {shouldShowPayrollChart(['Instructors']) && <InstructorComparisonChart />}

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

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(500px,1fr))] gap-8">
              {shouldShowClientChart(['Acquisition']) && <NewClientsByMonthChart />}
              {shouldShowClientChart(['Acquisition']) && <NewClientsByCategoryChart />}

              {shouldShowClientChart(['Retention']) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 [grid-column:1/-1]">
                    <RetentionFunnelChart />
                    <RetentionByClassChart />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 [grid-column:1/-1]">
                    <RetentionByInstructorChart />
                    <RetentionByClassNameChart />
                  </div>
                </>
              )}

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
