import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { parseExcelFile } from '../utils/excelParser';
import { calculateMetrics } from '../utils/dataProcessor';

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
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  
  // Parsed data
  const [dateRange, setDateRange] = useState(null);
  const [payrollData, setPayrollData] = useState([]);

  // Filter state
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });
  const [instructorFilter, setInstructorFilter] = useState([]);

  // Classes to exclude by default
  const excludedClasses = ['Front Desk'];

  // Filtered data (computed from payrollData, dateFilter, and instructorFilter)
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

  // Computed metrics (from filtered data)
  const metrics = useMemo(() => {
    return calculateMetrics(filteredPayrollData);
  }, [filteredPayrollData]);

  // UI state
  const [currentView, setCurrentView] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Handle Excel file upload
   */
  const handleExcelUpload = useCallback((file) => {
    setExcelFile(file);
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
   * Process Excel file and parse data
   */
  const processFiles = useCallback(async () => {
    if (!excelFile) {
      setError('Please upload an Excel file');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Parse Excel file
      const result = await parseExcelFile(excelFile);
      
      // Update state
      setDateRange(result.dateRange);
      setPayrollData(result.payrollData);

      // Reset filters when loading new data
      setDateFilter({ startDate: null, endDate: null });
      setInstructorFilter([]);

      // Switch to dashboard view
      setCurrentView('dashboard');
      
    } catch (err) {
      console.error('Error processing Excel file:', err);
      setError(err.message || 'Failed to process Excel file');
    } finally {
      setIsLoading(false);
    }
  }, [excelFile]);
  
  /**
   * Reset to initial state
   */
  const resetApp = useCallback(() => {
    setExcelFile(null);
    setLogoFile(null);
    
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoPreviewUrl(null);
    
    setDateRange(null);
    setPayrollData([]);
    setDateFilter({ startDate: null, endDate: null });
    setInstructorFilter([]);

    setCurrentView('upload');
    setError(null);
    setIsLoading(false);
  }, [logoPreviewUrl]);
  
  const value = {
    // Files
    excelFile,
    logoFile,
    logoPreviewUrl,

    // Parsed data
    dateRange,
    payrollData, // Original unfiltered data
    filteredPayrollData, // Filtered data (what charts/metrics should use)

    // Filter state
    dateFilter,
    setDateFilter,
    instructorFilter,
    setInstructorFilter,

    // Computed metrics (from filtered data)
    metrics,

    // UI state
    currentView,
    isLoading,
    error,

    // Actions
    handleExcelUpload,
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
