import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';

// Inline DatePresets component
const DatePresets = ({ onSelectPreset, dateExtent }) => {
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getPresets = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    const presets = [
      {
        label: 'This Year',
        start: formatDate(new Date(currentYear, 0, 1)),
        end: formatDate(new Date(currentYear, 11, 31))
      },
      {
        label: 'Last Year',
        start: formatDate(new Date(currentYear - 1, 0, 1)),
        end: formatDate(new Date(currentYear - 1, 11, 31))
      },
      {
        label: 'This Quarter',
        start: formatDate(new Date(currentYear, currentQuarter * 3, 1)),
        end: formatDate(new Date(currentYear, currentQuarter * 3 + 3, 0))
      },
      {
        label: 'Last Quarter',
        start: formatDate(new Date(currentYear, (currentQuarter - 1) * 3, 1)),
        end: formatDate(new Date(currentYear, (currentQuarter - 1) * 3 + 3, 0))
      },
      {
        label: 'This Month',
        start: formatDate(new Date(currentYear, currentMonth, 1)),
        end: formatDate(new Date(currentYear, currentMonth + 1, 0))
      },
      {
        label: 'Last Month',
        start: formatDate(new Date(currentYear, currentMonth - 1, 1)),
        end: formatDate(new Date(currentYear, currentMonth, 0))
      },
      {
        label: 'Last 90 Days',
        start: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
        end: formatDate(today)
      }
    ];

    // Add "All Time" if we have data extent
    if (dateExtent?.min && dateExtent?.max) {
      presets.push({
        label: 'All Time',
        start: formatDate(dateExtent.min),
        end: formatDate(dateExtent.max)
      });
    }

    return presets;
  };

  return (
    <div className="date-presets">
      {getPresets().map((preset) => (
        <button
          key={preset.label}
          className="preset-button"
          onClick={() => onSelectPreset({ start: preset.start, end: preset.end })}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};

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