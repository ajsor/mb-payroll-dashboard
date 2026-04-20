import React, { useState, useMemo, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';

const InstructorFilter = ({ onApply }) => {
  const { instructorFilter, setInstructorFilter, payrollData, dateFilter } = usePayroll();
  const [localSelectedInstructors, setLocalSelectedInstructors] = useState([]);

  const dateFilteredData = useMemo(() => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return payrollData;
    }

    return payrollData.filter(row => {
      if (!row.classDate) return true;

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

        return true;
      } catch {
        return true;
      }
    });
  }, [payrollData, dateFilter]);

  const instructorList = useMemo(() => {
    if (!dateFilteredData || dateFilteredData.length === 0) return [];

    const instructorStats = {};
    dateFilteredData.forEach(row => {
      if (row.instructorName) {
        if (!instructorStats[row.instructorName]) {
          instructorStats[row.instructorName] = 0;
        }
        if (row.classDate || row.className) {
          instructorStats[row.instructorName]++;
        }
      }
    });

    const instructors = Object.entries(instructorStats).map(([name, count]) => ({
      name,
      serviceCount: count
    }));

    return instructors.sort((a, b) => a.name.localeCompare(b.name));
  }, [dateFilteredData]);

  const handleSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setLocalSelectedInstructors(selected);
  };

  const handleSelectAll = () => {
    setLocalSelectedInstructors(instructorList.map(i => i.name));
  };

  const handleClearAll = () => {
    setLocalSelectedInstructors([]);
  };

  const handleApply = () => {
    setInstructorFilter(localSelectedInstructors);
    if (onApply) onApply();
  };

  const handleReset = () => {
    setLocalSelectedInstructors([]);
    setInstructorFilter([]);
  };

  useEffect(() => {
    setLocalSelectedInstructors([]);
    setInstructorFilter([]);
  }, [dateFilter, setInstructorFilter]);

  const isFiltered = instructorFilter.length > 0;

  const secondaryBtn = 'rounded-md border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium text-gray-600 cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100';

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-5">
      <h3 className="text-base font-semibold text-gray-700 mb-4 dark:text-slate-200">Filter by Instructor</h3>
      <div className="flex flex-col gap-4 max-w-[400px]">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Select Instructors (Ctrl/Cmd + click for multiple):
          </label>
          <select
            multiple
            value={localSelectedInstructors}
            onChange={handleSelectChange}
            size="4"
            className="w-full rounded-lg border-2 border-gray-300 bg-white p-1 text-[0.9rem] leading-[1.2] cursor-pointer transition-colors focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200"
          >
            {instructorList.map(instructor => (
              <option key={instructor.name} value={instructor.name} className="px-2 py-0.5 cursor-pointer">
                {instructor.name} ({instructor.serviceCount} services)
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSelectAll} className={secondaryBtn}>Select All</button>
          <button onClick={handleClearAll} className={secondaryBtn}>Clear All</button>
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
          Showing {instructorFilter.length} instructor{instructorFilter.length !== 1 ? 's' : ''}: {instructorFilter.join(', ')}
        </div>
      )}
    </div>
  );
};

export default InstructorFilter;
