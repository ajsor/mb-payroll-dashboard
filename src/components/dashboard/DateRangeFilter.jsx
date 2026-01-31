import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';
import DatePresets from './DatePresets';

const DateRangeFilter = ({ onApply }) => {
  const { dateFilter, setDateFilter, dateRange, payrollData } = usePayroll();
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');

  // Get min and max dates from payroll data
  const dateExtent = React.useMemo(() => {
    if (!payrollData || payrollData.length === 0) return { min: null, max: null };

    const dates = payrollData
      .map(row => row.classDate)
      .filter(Boolean)
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()));

    if (dates.length === 0) return { min: null, max: null };

    return {
      min: new Date(Math.min(...dates)),
      max: new Date(Math.max(...dates))
    };
  }, [payrollData]);

  // Format date for input[type=date] (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Pre-populate dates from data range when data loads
  useEffect(() => {
    if (dateExtent.min && dateExtent.max) {
      setLocalStartDate(formatDateForInput(dateExtent.min));
      setLocalEndDate(formatDateForInput(dateExtent.max));
    }
  }, [dateExtent.min, dateExtent.max]);

  // Handle apply filter
  const handleApply = () => {
    setDateFilter({
      startDate: localStartDate || null,
      endDate: localEndDate || null
    });
    if (onApply) onApply();
  };

  // Handle reset filter - resets to full date range
  const handleReset = () => {
    if (dateExtent.min && dateExtent.max) {
      setLocalStartDate(formatDateForInput(dateExtent.min));
      setLocalEndDate(formatDateForInput(dateExtent.max));
    } else {
      setLocalStartDate('');
      setLocalEndDate('');
    }
    setDateFilter({ startDate: null, endDate: null });
  };

  // Handle preset selection
  const handlePresetSelect = (range) => {
    setLocalStartDate(range.start);
    setLocalEndDate(range.end);
    setDateFilter({
      startDate: range.start || null,
      endDate: range.end || null
    });
    if (onApply) onApply();
  };

  const isFiltered = dateFilter.startDate || dateFilter.endDate;

  return (
    <div className="date-range-filter">
      <h3>Filter by Date Range</h3>
      <DatePresets onSelectPreset={handlePresetSelect} dateExtent={dateExtent} />
      <div className="filter-controls-vertical">
        <div className="filter-dates-row">
          <div className="filter-input-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              min={dateExtent.min ? formatDateForInput(dateExtent.min) : ''}
              max={dateExtent.max ? formatDateForInput(dateExtent.max) : ''}
            />
          </div>
          <div className="filter-input-group">
            <label>End Date:</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              min={dateExtent.min ? formatDateForInput(dateExtent.min) : ''}
              max={dateExtent.max ? formatDateForInput(dateExtent.max) : ''}
            />
          </div>
        </div>
        <div className="filter-actions">
          <button onClick={handleApply} className="apply-button">
            Apply Filter
          </button>
          <button onClick={handleReset} className="reset-filter-button" disabled={!isFiltered}>
            Clear Filter
          </button>
        </div>
      </div>
      {isFiltered && (
        <div className="filter-status">
          Showing data from {dateFilter.startDate || 'beginning'} to {dateFilter.endDate || 'end'}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;