import React, { useState, useRef, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Icons } from '../shared/Icons';
import HelpDialog from './HelpDialog';
import InviteModal from '../shared/InviteModal';

const TopToolbar = ({
  logo,
  onUploadClick,
  showDateFilter,
  setShowDateFilter,
  showInstructorFilter,
  setShowInstructorFilter,
  showServiceCategoryFilter,
  setShowServiceCategoryFilter,
  activeView,
  setActiveView
}) => {
  const {
    dateFilter,
    instructorFilter,
    serviceCategoryFilter,
    activeDashboard,
    setActiveDashboard,
    hasPayrollData,
    hasFirstVisitData
  } = usePayroll();

  const payrollViews = ['All', 'Payroll', 'Classes', 'Instructors', 'Insights'];
  const clientViews = ['All', 'Acquisition', 'Retention', 'Referrals', 'Insights'];
  const views = activeDashboard === 'payroll' ? payrollViews : clientViews;

  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const dashboardMenuRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.body.classList.contains('dark-mode');
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (dashboardMenuRef.current && !dashboardMenuRef.current.contains(event.target)) {
        setShowDashboardMenu(false);
      }
    };

    if (showExportMenu || showDashboardMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu, showDashboardMenu]);

  const dashboardTitle = activeDashboard === 'payroll' ? 'Payroll Dashboard' : 'Client Dashboard';
  const canSwitchDashboard = hasPayrollData && hasFirstVisitData;

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle('dark-mode', newMode);
    localStorage.setItem('darkMode', newMode ? 'true' : 'false');
  };

  const handlePrint = () => {
    window.print();
  };

  const hasDateFilter = dateFilter.startDate || dateFilter.endDate;
  const hasInstructorFilter = instructorFilter && instructorFilter.length > 0;
  const hasServiceCategoryFilter = serviceCategoryFilter && serviceCategoryFilter.length > 0;

  const closeAllFilters = () => {
    setShowDateFilter(false);
    setShowInstructorFilter(false);
    if (setShowServiceCategoryFilter) setShowServiceCategoryFilter(false);
  };

  const formatDateRange = () => {
    if (!hasDateFilter) return 'All Time';

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const start = dateFilter.startDate ? formatDate(dateFilter.startDate) : 'Start';
    const end = dateFilter.endDate ? formatDate(dateFilter.endDate) : 'Present';

    return `${start} - ${end}`;
  };

  const iconBtnBase = 'relative flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-transparent text-gray-500 cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200';
  const iconBtnActive = '!bg-blue-50 !text-blue-500 dark:!bg-blue-950 dark:!text-blue-400';

  return (
    <div className="sticky top-0 z-[100] flex items-center justify-between bg-white px-8 py-3 border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {logo && (
          <img src={logo} alt="Company Logo" className="h-9 max-w-[160px] object-contain" />
        )}
        <div
          className={`relative ${canSwitchDashboard ? 'cursor-pointer group' : ''}`}
          ref={dashboardMenuRef}
          onMouseEnter={() => canSwitchDashboard && setShowDashboardMenu(true)}
          onMouseLeave={() => setShowDashboardMenu(false)}
        >
          <span className="flex items-center gap-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">
            {dashboardTitle}
            {canSwitchDashboard && (
              <span className="flex items-center opacity-50 transition-opacity group-hover:opacity-100">{Icons.chevronDown}</span>
            )}
          </span>
          {canSwitchDashboard && showDashboardMenu && (
            <div className="absolute top-full left-0 pt-1 z-[100]">
              {activeDashboard === 'payroll' ? (
                <button
                  onClick={() => { setActiveDashboard('client'); setActiveView('All'); setShowDashboardMenu(false); }}
                  className="block w-full whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm text-gray-700 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Switch to Client Dashboard
                </button>
              ) : (
                <button
                  onClick={() => { setActiveDashboard('payroll'); setActiveView('All'); setShowDashboardMenu(false); }}
                  className="block w-full whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm text-gray-700 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Switch to Payroll Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-slate-700">
        {views.map(view => (
          <button
            key={view}
            className={`px-4 py-2 border-0 rounded-md text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${
              activeView === view
                ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:bg-slate-600 dark:text-slate-100 dark:shadow-none'
                : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/10'
            }`}
            onClick={() => setActiveView(view)}
          >
            {view}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        <span
          className="mr-2 whitespace-nowrap rounded-md bg-gray-100 px-3 py-1.5 text-[13px] text-gray-500 dark:bg-slate-700 dark:text-slate-400"
          title="Current date range filter"
        >
          {formatDateRange()}
        </span>

        <button
          className={`${iconBtnBase} ${showDateFilter ? iconBtnActive : ''}`}
          onClick={() => {
            const willShow = !showDateFilter;
            closeAllFilters();
            setShowDateFilter(willShow);
          }}
          title="Filter by Date Range"
        >
          {Icons.calendar}
          {hasDateFilter && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />}
        </button>

        {activeDashboard === 'payroll' && (
          <button
            className={`${iconBtnBase} ${showInstructorFilter ? iconBtnActive : ''}`}
            onClick={() => {
              const willShow = !showInstructorFilter;
              closeAllFilters();
              setShowInstructorFilter(willShow);
            }}
            title="Filter by Instructor"
          >
            {Icons.user}
            {hasInstructorFilter && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />}
          </button>
        )}

        {activeDashboard === 'client' && setShowServiceCategoryFilter && (
          <button
            className={`${iconBtnBase} ${showServiceCategoryFilter ? iconBtnActive : ''}`}
            onClick={() => {
              const willShow = !showServiceCategoryFilter;
              closeAllFilters();
              setShowServiceCategoryFilter(willShow);
            }}
            title="Filter by Service Category"
          >
            {Icons.grid}
            {hasServiceCategoryFilter && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />}
          </button>
        )}

        <div className="w-px h-6 bg-gray-200 mx-2 dark:bg-slate-700" />

        <div className="relative" ref={exportRef}>
          <button
            className={`${iconBtnBase} ${showExportMenu ? iconBtnActive : ''}`}
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Data"
          >
            {Icons.download}
          </button>

          {showExportMenu && (
            <div className="absolute top-[calc(100%+8px)] right-0 z-[200] min-w-[180px] overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] dark:border-slate-700 dark:bg-slate-800">
              <button
                className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-sm text-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700 [&_svg]:text-gray-500 dark:[&_svg]:text-slate-400"
                onClick={() => { document.querySelector('.export-excel-trigger')?.click(); setShowExportMenu(false); }}
              >
                {Icons.excel}
                <span>Export to Excel</span>
              </button>
              <button
                className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-sm text-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700 [&_svg]:text-gray-500 dark:[&_svg]:text-slate-400"
                onClick={() => { document.querySelector('.export-csv-trigger')?.click(); setShowExportMenu(false); }}
              >
                {Icons.csv}
                <span>Export to CSV</span>
              </button>
              <button
                className="flex w-full items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-sm text-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-700 [&_svg]:text-gray-500 dark:[&_svg]:text-slate-400"
                onClick={() => { handlePrint(); setShowExportMenu(false); }}
              >
                {Icons.printer}
                <span>Print / PDF</span>
              </button>
            </div>
          )}
        </div>

        <button
          className={iconBtnBase}
          onClick={onUploadClick}
          title="Upload New File"
        >
          {Icons.upload}
        </button>

        <div className="w-px h-6 bg-gray-200 mx-2 dark:bg-slate-700" />

        <button
          className={iconBtnBase}
          onClick={() => setShowInvite(true)}
          title="Invite a user to MB Dashboard"
        >
          {Icons.userPlus}
        </button>

        <button
          className={iconBtnBase}
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? Icons.sun : Icons.moon}
        </button>

        <button
          className={iconBtnBase}
          onClick={() => setShowHelp(true)}
          title="Help"
        >
          {Icons.help}
        </button>
      </div>

      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
};

export default TopToolbar;
