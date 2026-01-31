import React, { useState, useMemo } from 'react';
import { usePayroll } from '../../context/PayrollContext';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Decode HTML entities like &#8482; to their actual symbols
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};
const HOURS = Array.from({ length: 17 }, (_, i) => i + 5); // 5am to 9pm (5-21)

// Format hour for display (5 -> "5 AM", 13 -> "1 PM")
const formatHour = (hour) => {
  if (hour === 0 || hour === 12) return `12 ${hour === 0 ? 'AM' : 'PM'}`;
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

// Parse time string to get hour
const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;

  const str = String(timeStr).trim();

  // Handle HH:MM format
  const colonMatch = str.match(/^(\d{1,2}):(\d{2})/);
  if (colonMatch) {
    let hour = parseInt(colonMatch[1], 10);
    // Check for AM/PM
    if (str.toLowerCase().includes('pm') && hour !== 12) {
      hour += 12;
    } else if (str.toLowerCase().includes('am') && hour === 12) {
      hour = 0;
    }
    return hour;
  }

  // Handle decimal time (Excel time fraction)
  const num = parseFloat(str);
  if (!isNaN(num) && num >= 0 && num < 1) {
    return Math.floor(num * 24);
  }

  return null;
};

// Get color based on attendance value
const getHeatmapColor = (value, maxValue) => {
  if (value === null || value === undefined) return '#f5f5f5';
  if (value === 0) return '#e0e0e0';

  const ratio = value / maxValue;

  // Color scale from light blue to dark blue/purple
  if (ratio < 0.25) return '#e3f2fd';
  if (ratio < 0.5) return '#90caf9';
  if (ratio < 0.75) return '#42a5f5';
  return '#1565c0';
};

const AttendanceHeatmap = () => {
  const { filteredPayrollData } = usePayroll();
  const [selectedCell, setSelectedCell] = useState(null); // { day: 0-6, hour: 5-21 }
  const [sortConfig, setSortConfig] = useState({ key: 'classDate', direction: 'desc' });

  // Calculate average attendance for each day/hour combination
  const { heatmapData, maxAvg } = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      return { heatmapData: {}, maxAvg: 0 };
    }

    // Initialize data structure: { "day-hour": { total: 0, count: 0, classes: [] } }
    const data = {};

    filteredPayrollData.forEach(row => {
      if (!row.classDate || !row.classTime) return;

      const date = new Date(row.classDate);
      if (isNaN(date.getTime())) return;

      const dayOfWeek = date.getDay(); // 0 = Sunday
      const hour = parseTimeToHour(row.classTime);

      if (hour === null || hour < 5 || hour > 21) return;

      const key = `${dayOfWeek}-${hour}`;
      const attendance = row.staffPaid || 0;

      if (!data[key]) {
        data[key] = { total: 0, count: 0, classes: [] };
      }

      data[key].total += attendance;
      data[key].count++;
      data[key].classes.push({
        classDate: row.classDate,
        className: decodeHtmlEntities(row.className) || 'Unknown',
        attendance: attendance,
        instructorName: decodeHtmlEntities(row.instructorName) || 'Unknown'
      });
    });

    // Calculate averages and find max
    let maxAvg = 0;
    Object.keys(data).forEach(key => {
      data[key].avg = data[key].count > 0 ? data[key].total / data[key].count : 0;
      if (data[key].avg > maxAvg) {
        maxAvg = data[key].avg;
      }
    });

    return { heatmapData: data, maxAvg };
  }, [filteredPayrollData]);

  // Get classes for selected cell
  const selectedCellData = useMemo(() => {
    if (!selectedCell) return null;
    const key = `${selectedCell.day}-${selectedCell.hour}`;
    return heatmapData[key] || null;
  }, [selectedCell, heatmapData]);

  // Sort the classes based on sortConfig
  const sortedClasses = useMemo(() => {
    if (!selectedCellData) return [];

    const sorted = [...selectedCellData.classes].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case 'classDate':
          aVal = new Date(a.classDate);
          bVal = new Date(b.classDate);
          break;
        case 'className':
          aVal = a.className.toLowerCase();
          bVal = b.className.toLowerCase();
          break;
        case 'attendance':
          aVal = a.attendance;
          bVal = b.attendance;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [selectedCellData, sortConfig]);

  // Handle column header click for sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Handle cell click
  const handleCellClick = (dayIndex, hour, cellData) => {
    if (!cellData || cellData.count === 0) return;

    setSelectedCell(prev => {
      if (prev && prev.day === dayIndex && prev.hour === hour) {
        return null; // Toggle off if same cell clicked
      }
      return { day: dayIndex, hour: hour };
    });
  };

  if (!filteredPayrollData || filteredPayrollData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Average Attendance by Day & Time</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Average Attendance by Day & Time</h3>
      <p className="chart-subtitle">Darker colors indicate higher average attendance</p>

      <div className="heatmap-wrapper">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-header-cell">Time</th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day} className="heatmap-header-cell">{day.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="heatmap-time-cell">{formatHour(hour)}</td>
                {DAYS_OF_WEEK.map((_, dayIndex) => {
                  const key = `${dayIndex}-${hour}`;
                  const cellData = heatmapData[key];
                  const avg = cellData ? cellData.avg : null;
                  const count = cellData ? cellData.count : 0;
                  const isSelected = selectedCell && selectedCell.day === dayIndex && selectedCell.hour === hour;

                  return (
                    <td
                      key={dayIndex}
                      className={`heatmap-cell ${count > 0 ? 'heatmap-cell-clickable' : ''} ${isSelected ? 'heatmap-cell-selected' : ''}`}
                      style={{ backgroundColor: isSelected ? '#ff7300' : getHeatmapColor(avg, maxAvg) }}
                      title={avg !== null ? `Avg: ${avg.toFixed(1)} (${count} classes) - Click for details` : 'No classes'}
                      onClick={() => handleCellClick(dayIndex, hour, cellData)}
                    >
                      {avg !== null ? avg.toFixed(1) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="heatmap-legend">
        <span>Lower</span>
        <div className="legend-scale">
          <div style={{ backgroundColor: '#e3f2fd' }}></div>
          <div style={{ backgroundColor: '#90caf9' }}></div>
          <div style={{ backgroundColor: '#42a5f5' }}></div>
          <div style={{ backgroundColor: '#1565c0' }}></div>
        </div>
        <span>Higher</span>
      </div>

      {selectedCellData && (
        <div className="heatmap-detail-table">
          <h4>
            Classes on {DAYS_OF_WEEK[selectedCell.day]}s at {formatHour(selectedCell.hour)}
            <button
              className="close-detail-btn"
              onClick={() => setSelectedCell(null)}
            >
              Close
            </button>
          </h4>
          <p className="detail-summary">
            {selectedCellData.count} classes |
            Total Attendance: {selectedCellData.total} |
            Average: {selectedCellData.avg.toFixed(1)}
          </p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('classDate')} className="sortable-header">
                    Class Date{getSortIndicator('classDate')}
                  </th>
                  <th onClick={() => handleSort('className')} className="sortable-header">
                    Class Name{getSortIndicator('className')}
                  </th>
                  <th onClick={() => handleSort('attendance')} className="sortable-header">
                    Attendance{getSortIndicator('attendance')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map((cls, idx) => (
                  <tr key={idx}>
                    <td>{cls.classDate}</td>
                    <td>{cls.className}</td>
                    <td>{cls.attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHeatmap;
