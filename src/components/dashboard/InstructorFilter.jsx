import React, { useState, useMemo, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';

const InstructorFilter = ({ onApply }) => {
  const { instructorFilter, setInstructorFilter, payrollData, dateFilter } = usePayroll();
  const [localSelectedInstructors, setLocalSelectedInstructors] = useState([]);

  // Apply date filter first to get available instructors
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

  // Get unique instructors from date-filtered data with their service counts
  const instructorList = useMemo(() => {
    if (!dateFilteredData || dateFilteredData.length === 0) return [];

    const instructorStats = {};
    dateFilteredData.forEach(row => {
      if (row.instructorName) {
        if (!instructorStats[row.instructorName]) {
          instructorStats[row.instructorName] = 0;
        }
        // Count rows with actual class data (not just totals)
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

  // Handle dropdown selection
  const handleSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setLocalSelectedInstructors(selected);
  };

  // Handle select all
  const handleSelectAll = () => {
    setLocalSelectedInstructors(instructorList.map(i => i.name));
  };

  // Handle clear all
  const handleClearAll = () => {
    setLocalSelectedInstructors([]);
  };

  // Handle apply filter
  const handleApply = () => {
    setInstructorFilter(localSelectedInstructors);
    if (onApply) onApply();
  };

  // Handle reset filter
  const handleReset = () => {
    setLocalSelectedInstructors([]);
    setInstructorFilter([]);
  };

  // Reset local selection when date filter changes
  useEffect(() => {
    setLocalSelectedInstructors([]);
    setInstructorFilter([]);
  }, [dateFilter, setInstructorFilter]);

  const isFiltered = instructorFilter.length > 0;

  return (
    <div className="instructor-filter">
      <h3>Filter by Instructor</h3>
      <div className="filter-controls-vertical">
        <div className="filter-input-group">
          <label>
            Select Instructors (Ctrl/Cmd + click for multiple):
          </label>
          <select
            multiple
            value={localSelectedInstructors}
            onChange={handleSelectChange}
            size="4"
            className="instructor-select"
          >
            {instructorList.map(instructor => (
              <option key={instructor.name} value={instructor.name}>
                {instructor.name} ({instructor.serviceCount} services)
              </option>
            ))}
          </select>
        </div>
        <div className="filter-buttons-row">
          <button onClick={handleSelectAll} className="secondary-button">
            Select All
          </button>
          <button onClick={handleClearAll} className="secondary-button">
            Clear All
          </button>
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
          Showing {instructorFilter.length} instructor{instructorFilter.length !== 1 ? 's' : ''}: {instructorFilter.join(', ')}
        </div>
      )}
    </div>
  );
};

export default InstructorFilter;
