import React, { useState, useMemo, useEffect } from 'react';
import { usePayroll } from '../../context/PayrollContext';

const ServiceCategoryFilter = ({ onApply }) => {
  const {
    serviceCategoryFilter,
    setServiceCategoryFilter,
    firstVisitData,
    dateFilter
  } = usePayroll();
  const [localSelectedCategories, setLocalSelectedCategories] = useState([]);

  // Apply date filter first to get available service categories
  const dateFilteredData = useMemo(() => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return firstVisitData;
    }

    return firstVisitData.filter(row => {
      if (!row.firstVisitDateStr) return true;

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

        return true;
      } catch {
        return true;
      }
    });
  }, [firstVisitData, dateFilter]);

  // Get unique service categories from date-filtered data with their counts
  const categoryList = useMemo(() => {
    if (!dateFilteredData || dateFilteredData.length === 0) return [];

    const categoryStats = {};
    dateFilteredData.forEach(row => {
      if (row.serviceCategory) {
        if (!categoryStats[row.serviceCategory]) {
          categoryStats[row.serviceCategory] = 0;
        }
        categoryStats[row.serviceCategory]++;
      }
    });

    const categories = Object.entries(categoryStats).map(([name, count]) => ({
      name,
      clientCount: count
    }));

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }, [dateFilteredData]);

  // Handle dropdown selection
  const handleSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setLocalSelectedCategories(selected);
  };

  // Handle select all
  const handleSelectAll = () => {
    setLocalSelectedCategories(categoryList.map(c => c.name));
  };

  // Handle clear all
  const handleClearAll = () => {
    setLocalSelectedCategories([]);
  };

  // Handle apply filter
  const handleApply = () => {
    setServiceCategoryFilter(localSelectedCategories);
    if (onApply) onApply();
  };

  // Handle reset filter
  const handleReset = () => {
    setLocalSelectedCategories([]);
    setServiceCategoryFilter([]);
  };

  // Reset local selection when date filter changes
  useEffect(() => {
    setLocalSelectedCategories([]);
    setServiceCategoryFilter([]);
  }, [dateFilter, setServiceCategoryFilter]);

  const isFiltered = serviceCategoryFilter.length > 0;

  return (
    <div className="instructor-filter">
      <h3>Filter by Service Category</h3>
      <div className="filter-controls-vertical">
        <div className="filter-input-group">
          <label>
            Select Categories (Ctrl/Cmd + click for multiple):
          </label>
          <select
            multiple
            value={localSelectedCategories}
            onChange={handleSelectChange}
            size="4"
            className="instructor-select"
          >
            {categoryList.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.clientCount} clients)
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
          Showing {serviceCategoryFilter.length} categor{serviceCategoryFilter.length !== 1 ? 'ies' : 'y'}: {serviceCategoryFilter.join(', ')}
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryFilter;
