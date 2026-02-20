import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { parseExcelFile } from '../utils/excelParser';
import { calculateMetrics } from '../utils/dataProcessor';
import { parseFirstVisitFile, calculateFirstVisitMetrics } from '../utils/firstVisitParser';

const PayrollContext = createContext(null);

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within PayrollProvider');
  }
  return context;
};

export const PayrollProvider = ({ children }) => {
  // File state
  const [excelFile, setExcelFile] = useState(null);
  const [firstVisitFile, setFirstVisitFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);

  // Parsed Payroll data
  const [dateRange, setDateRange] = useState(null);
  const [payrollData, setPayrollData] = useState([]);

  // Parsed First Visit data
  const [firstVisitData, setFirstVisitData] = useState([]);
  const [firstVisitDateRange, setFirstVisitDateRange] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [referralTypes, setReferralTypes] = useState([]);

  // Filter state (shared)
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });
  const [instructorFilter, setInstructorFilter] = useState([]);

  // Filter state (Client Dashboard specific)
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState([]);
  const [staffFilter, setStaffFilter] = useState([]);

  // Classes to exclude by default
  const excludedClasses = ['Front Desk'];

  // Filtered Payroll data
  const filteredPayrollData = useMemo(() => {
    const hasDateFilter = dateFilter.startDate || dateFilter.endDate;
    const hasInstructorFilter = instructorFilter.length > 0;

    return payrollData.filter(row => {
      // Always exclude certain classes
      if (row.className && excludedClasses.includes(row.className)) {
        return false;
      }

      // Instructor filter
      if (hasInstructorFilter) {
        if (!row.instructorName || !instructorFilter.includes(row.instructorName)) {
          return false;
        }
      }

      // Date filter
      if (hasDateFilter && row.classDate) {
        try {
          const rowDate = new Date(row.classDate);

          if (dateFilter.startDate) {
            const start = new Date(dateFilter.startDate);
            if (rowDate < start) return false;
          }

          if (dateFilter.endDate) {
            const end = new Date(dateFilter.endDate);
            if (rowDate > end) return false;
          }
        } catch {
          // Keep rows with invalid dates when date filter is active
        }
      }

      return true;
    });
  }, [payrollData, dateFilter, instructorFilter]);

  // Filtered First Visit data
  const filteredFirstVisitData = useMemo(() => {
    const hasDateFilter = dateFilter.startDate || dateFilter.endDate;
    const hasServiceCategoryFilter = serviceCategoryFilter.length > 0;
    const hasStaffFilter = staffFilter.length > 0;

    return firstVisitData.filter(row => {
      // Service category filter
      if (hasServiceCategoryFilter) {
        if (!row.serviceCategory || !serviceCategoryFilter.includes(row.serviceCategory)) {
          return false;
        }
      }

      // Staff filter
      if (hasStaffFilter) {
        if (!row.staff || !staffFilter.includes(row.staff)) {
          return false;
        }
      }

      // Date filter (by first visit date)
      if (hasDateFilter && row.firstVisitDateStr) {
        try {
          const [year, month, day] = row.firstVisitDateStr.split('-').map(Number);
          const rowDate = new Date(year, month - 1, day);

          if (dateFilter.startDate) {
            const [sy, sm, sd] = dateFilter.startDate.split('-').map(Number);
            const start = new Date(sy, sm - 1, sd);
            if (rowDate < start) return false;
          }

          if (dateFilter.endDate) {
            const [ey, em, ed] = dateFilter.endDate.split('-').map(Number);
            const end = new Date(ey, em - 1, ed);
            if (rowDate > end) return false;
          }
        } catch {
          // Keep rows with invalid dates when date filter is active
        }
      }

      return true;
    });
  }, [firstVisitData, dateFilter, serviceCategoryFilter, staffFilter]);

  // Computed metrics (Payroll - from filtered data)
  const metrics = useMemo(() => {
    return calculateMetrics(filteredPayrollData);
  }, [filteredPayrollData]);

  // Computed metrics (First Visit - from filtered data)
  const firstVisitMetrics = useMemo(() => {
    return calculateFirstVisitMetrics(filteredFirstVisitData);
  }, [filteredFirstVisitData]);

  // UI state
  const [currentView, setCurrentView] = useState('upload');
  const [activeDashboard, setActiveDashboard] = useState('payroll'); // 'payroll' or 'client'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Computed: which dashboards are available based on parsed data
  const hasPayrollData = payrollData.length > 0;
  const hasFirstVisitData = firstVisitData.length > 0;

  /**
   * Handle Excel file upload (Payroll Report)
   */
  const handleExcelUpload = useCallback((file) => {
    setExcelFile(file);
    setError(null);
  }, []);

  /**
   * Handle First Visit Report file upload
   */
  const handleFirstVisitUpload = useCallback((file) => {
    setFirstVisitFile(file);
    setError(null);
  }, []);

  /**
   * Handle logo file upload
   */
  const handleLogoUpload = useCallback((file) => {
    setLogoFile(file);

    // Create preview URL
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(previewUrl);
    setError(null);
  }, [logoPreviewUrl]);

  /**
   * Process uploaded files and parse data
   */
  const processFiles = useCallback(async () => {
    if (!excelFile && !firstVisitFile) {
      setError('Please upload at least one report file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parse Payroll Excel file if provided
      if (excelFile) {
        const result = await parseExcelFile(excelFile);
        setDateRange(result.dateRange);
        setPayrollData(result.payrollData);
      }

      // Parse First Visit file if provided
      if (firstVisitFile) {
        const result = await parseFirstVisitFile(firstVisitFile);
        setFirstVisitData(result.firstVisitData);
        setFirstVisitDateRange(result.dateRange);
        setServiceCategories(result.serviceCategories);
        setStaffList(result.staffList);
        setReferralTypes(result.referralTypes);
      }

      // Set active dashboard based on what was uploaded
      if (excelFile) {
        setActiveDashboard('payroll');
      } else if (firstVisitFile) {
        setActiveDashboard('client');
      }

      // Reset filters when loading new data
      setDateFilter({ startDate: null, endDate: null });
      setInstructorFilter([]);
      setServiceCategoryFilter([]);
      setStaffFilter([]);

      // Switch to dashboard view
      setCurrentView('dashboard');

    } catch (err) {
      console.error('Error processing files:', err);
      setError(err.message || 'Failed to process files');
    } finally {
      setIsLoading(false);
    }
  }, [excelFile, firstVisitFile]);

  /**
   * Reset to initial state
   */
  const resetApp = useCallback(() => {
    setExcelFile(null);
    setFirstVisitFile(null);
    setLogoFile(null);

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(null);

    // Reset Payroll data
    setDateRange(null);
    setPayrollData([]);

    // Reset First Visit data
    setFirstVisitData([]);
    setFirstVisitDateRange(null);
    setServiceCategories([]);
    setStaffList([]);
    setReferralTypes([]);

    // Reset filters
    setDateFilter({ startDate: null, endDate: null });
    setInstructorFilter([]);
    setServiceCategoryFilter([]);
    setStaffFilter([]);

    setActiveDashboard('payroll');
    setCurrentView('upload');
    setError(null);
    setIsLoading(false);
  }, [logoPreviewUrl]);

  const value = {
    // Files
    excelFile,
    firstVisitFile,
    logoFile,
    logoPreviewUrl,

    // Parsed Payroll data
    dateRange,
    payrollData,
    filteredPayrollData,

    // Parsed First Visit data
    firstVisitData,
    filteredFirstVisitData,
    firstVisitDateRange,
    serviceCategories,
    staffList,
    referralTypes,

    // Filter state (shared)
    dateFilter,
    setDateFilter,
    instructorFilter,
    setInstructorFilter,

    // Filter state (Client Dashboard)
    serviceCategoryFilter,
    setServiceCategoryFilter,
    staffFilter,
    setStaffFilter,

    // Computed metrics
    metrics,
    firstVisitMetrics,

    // UI state
    currentView,
    activeDashboard,
    setActiveDashboard,
    hasPayrollData,
    hasFirstVisitData,
    isLoading,
    error,

    // Actions
    handleExcelUpload,
    handleFirstVisitUpload,
    handleLogoUpload,
    processFiles,
    resetApp
  };

  return (
    <PayrollContext.Provider value={value}>
      {children}
    </PayrollContext.Provider>
  );
};
