import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';

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
      { label: 'This Year', start: formatDate(new Date(currentYear, 0, 1)), end: formatDate(new Date(currentYear, 11, 31)) },
      { label: 'Last Year', start: formatDate(new Date(currentYear - 1, 0, 1)), end: formatDate(new Date(currentYear - 1, 11, 31)) },
      { label: 'This Quarter', start: formatDate(new Date(currentYear, currentQuarter * 3, 1)), end: formatDate(new Date(currentYear, currentQuarter * 3 + 3, 0)) },
      { label: 'Last Quarter', start: formatDate(new Date(currentYear, (currentQuarter - 1) * 3, 1)), end: formatDate(new Date(currentYear, (currentQuarter - 1) * 3 + 3, 0)) },
      { label: 'This Month', start: formatDate(new Date(currentYear, currentMonth, 1)), end: formatDate(new Date(currentYear, currentMonth + 1, 0)) },
      { label: 'Last Month', start: formatDate(new Date(currentYear, currentMonth - 1, 1)), end: formatDate(new Date(currentYear, currentMonth, 0)) },
      { label: 'Last 90 Days', start: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)), end: formatDate(today) }
    ];

    if (dateExtent?.min && dateExtent?.max) {
      presets.push({ label: 'All Time', start: formatDate(dateExtent.min), end: formatDate(dateExtent.max) });
    }

    return presets;
  };

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {getPresets().map((preset) => (
        <button
          key={preset.label}
          className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-500 hover:text-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-indigo-500 dark:hover:text-white"
          onClick={() => onSelectPreset({ start: preset.start, end: preset.end })}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};

const DateRangeFilter = ({ onApply }) => {
  const { dateFilter, setDateFilter, payrollData } = usePayroll();
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');

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

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (dateExtent.min && dateExtent.max) {
      setLocalStartDate(formatDateForInput(dateExtent.min));
      setLocalEndDate(formatDateForInput(dateExtent.max));
    }
  }, [dateExtent.min, dateExtent.max]);

  const handleApply = () => {
    setDateFilter({
      startDate: localStartDate || null,
      endDate: localEndDate || null
    });
    if (onApply) onApply();
  };

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

  const handlePresetSelect = (range) => {
    setLocalStartDate(range.start);
    setLocalEndDate(range.end);
    setDateFilter({ startDate: range.start || null, endDate: range.end || null });
    if (onApply) onApply();
  };

  const isFiltered = dateFilter.startDate || dateFilter.endDate;

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-5">
      <h3 className="text-base font-semibold text-gray-700 mb-4 dark:text-slate-200">Filter by Date Range</h3>
      <DatePresets onSelectPreset={handlePresetSelect} dateExtent={dateExtent} />
      <div className="flex flex-col gap-4 max-w-[400px]">
        <div className="flex gap-3 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">Start Date:</label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              min={dateExtent.min ? formatDateForInput(dateExtent.min) : ''}
              max={dateExtent.max ? formatDateForInput(dateExtent.max) : ''}
              className="w-[145px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-all hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-800"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">End Date:</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              min={dateExtent.min ? formatDateForInput(dateExtent.min) : ''}
              max={dateExtent.max ? formatDateForInput(dateExtent.max) : ''}
              className="w-[145px] rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-all hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200 dark:focus:bg-slate-800"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="rounded-md border-0 bg-indigo-500 px-4 py-2 text-[13px] font-medium text-white cursor-pointer transition-colors hover:bg-indigo-600"
          >
            Apply Filter
          </button>
          <button
            onClick={handleReset}
            disabled={!isFiltered}
            className="rounded-md border border-gray-200 bg-transparent px-4 py-2 text-[13px] font-medium text-gray-500 cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            Clear Filter
          </button>
        </div>
      </div>
      {isFiltered && (
        <div className="mt-3 rounded border-l-[3px] border-indigo-500 bg-indigo-50 px-3 py-2 text-[13px] font-medium text-gray-700 dark:bg-indigo-950/40 dark:text-slate-200">
          Showing data from {dateFilter.startDate || 'beginning'} to {dateFilter.endDate || 'end'}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
