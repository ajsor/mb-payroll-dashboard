import React, { useState, useRef, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { Icons } from '../shared/Icons';
import HelpDialog from './HelpDialog';

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

  // Views change based on active dashboard
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
  const exportRef = useRef(null);

  // Close export menu when clicking outside
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

  // Determine dashboard title
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

  // Check if filters are active
  const hasDateFilter = dateFilter.startDate || dateFilter.endDate;
  const hasInstructorFilter = instructorFilter && instructorFilter.length > 0;
  const hasServiceCategoryFilter = serviceCategoryFilter && serviceCategoryFilter.length > 0;

  // Helper to close all filter panels
  const closeAllFilters = () => {
    setShowDateFilter(false);
    setShowInstructorFilter(false);
    if (setShowServiceCategoryFilter) setShowServiceCategoryFilter(false);
  };

  // Format date range for display
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

  return (
    <div className="top-toolbar">
      <div className="toolbar-left">
        {logo && (
          <img src={logo} alt="Company Logo" className="toolbar-logo" />
        )}
        <div
          className={`toolbar-title-container ${canSwitchDashboard ? 'has-menu' : ''}`}
          ref={dashboardMenuRef}
          onMouseEnter={() => canSwitchDashboard && setShowDashboardMenu(true)}
          onMouseLeave={() => setShowDashboardMenu(false)}
        >
          <span className="toolbar-title">
            {dashboardTitle}
            {canSwitchDashboard && (
              <span className="toolbar-title-arrow">{Icons.chevronDown}</span>
            )}
          </span>
          {canSwitchDashboard && showDashboardMenu && (
            <div className="toolbar-dashboard-menu">
              {activeDashboard === 'payroll' ? (
                <button
                  onClick={() => { setActiveDashboard('client'); setActiveView('All'); setShowDashboardMenu(false); }}
                >
                  Switch to Client Dashboard
                </button>
              ) : (
                <button
                  onClick={() => { setActiveDashboard('payroll'); setActiveView('All'); setShowDashboardMenu(false); }}
                >
                  Switch to Payroll Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="toolbar-nav">
        {views.map(view => (
          <button
            key={view}
            className={`toolbar-nav-item ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
          >
            {view}
          </button>
        ))}
      </nav>

      <div className="toolbar-right">
        <span className="toolbar-date-range" title="Current date range filter">
          {formatDateRange()}
        </span>

        <button
          className={`toolbar-icon-btn ${showDateFilter ? 'active' : ''} ${hasDateFilter ? 'has-filter' : ''}`}
          onClick={() => {
            const willShow = !showDateFilter;
            closeAllFilters();
            setShowDateFilter(willShow);
          }}
          title="Filter by Date Range"
        >
          {Icons.calendar}
          {hasDateFilter && <span className="filter-indicator" />}
        </button>

        {/* Instructor filter - Payroll Dashboard only */}
        {activeDashboard === 'payroll' && (
          <button
            className={`toolbar-icon-btn ${showInstructorFilter ? 'active' : ''} ${hasInstructorFilter ? 'has-filter' : ''}`}
            onClick={() => {
              const willShow = !showInstructorFilter;
              closeAllFilters();
              setShowInstructorFilter(willShow);
            }}
            title="Filter by Instructor"
          >
            {Icons.user}
            {hasInstructorFilter && <span className="filter-indicator" />}
          </button>
        )}

        {/* Service Category filter - Client Dashboard only */}
        {activeDashboard === 'client' && setShowServiceCategoryFilter && (
          <button
            className={`toolbar-icon-btn ${showServiceCategoryFilter ? 'active' : ''} ${hasServiceCategoryFilter ? 'has-filter' : ''}`}
            onClick={() => {
              const willShow = !showServiceCategoryFilter;
              closeAllFilters();
              setShowServiceCategoryFilter(willShow);
            }}
            title="Filter by Service Category"
          >
            {Icons.grid}
            {hasServiceCategoryFilter && <span className="filter-indicator" />}
          </button>
        )}

        <div className="toolbar-divider" />

        <div className="toolbar-export-container" ref={exportRef}>
          <button
            className={`toolbar-icon-btn ${showExportMenu ? 'active' : ''}`}
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Data"
          >
            {Icons.download}
          </button>

          {showExportMenu && (
            <div className="toolbar-export-menu">
              <button onClick={() => { document.querySelector('.export-excel-trigger')?.click(); setShowExportMenu(false); }}>
                {Icons.excel}
                <span>Export to Excel</span>
              </button>
              <button onClick={() => { document.querySelector('.export-csv-trigger')?.click(); setShowExportMenu(false); }}>
                {Icons.csv}
                <span>Export to CSV</span>
              </button>
              <button onClick={() => { handlePrint(); setShowExportMenu(false); }}>
                {Icons.printer}
                <span>Print / PDF</span>
              </button>
            </div>
          )}
        </div>

        <button
          className="toolbar-icon-btn"
          onClick={onUploadClick}
          title="Upload New File"
        >
          {Icons.upload}
        </button>

        <div className="toolbar-divider" />

        <button
          className="toolbar-icon-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? Icons.sun : Icons.moon}
        </button>

        <button
          className="toolbar-icon-btn"
          onClick={() => setShowHelp(true)}
          title="Help"
        >
          {Icons.help}
        </button>
      </div>

      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default TopToolbar;
