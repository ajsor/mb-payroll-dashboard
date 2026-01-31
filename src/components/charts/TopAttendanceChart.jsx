import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

// Decode HTML entities like &#8482; to their actual symbols
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const TopAttendanceChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'classDate', direction: 'desc' });

  // Calculate average attendance per instructor
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    const instructorStats = {};

    filteredPayrollData.forEach(row => {
      if (!row.instructorName) return;

      if (!instructorStats[row.instructorName]) {
        instructorStats[row.instructorName] = {
          name: decodeHtmlEntities(row.instructorName),
          totalAttendance: 0,
          classCount: 0,
          classes: []
        };
      }

      const attendance = row.staffPaid || 0;
      instructorStats[row.instructorName].totalAttendance += attendance;
      instructorStats[row.instructorName].classCount++;
      instructorStats[row.instructorName].classes.push({
        className: row.className || 'Unknown',
        classDate: row.classDate || 'Unknown',
        attendance: attendance
      });
    });

    // Calculate averages and sort by highest average
    const result = Object.values(instructorStats)
      .map(stat => ({
        ...stat,
        avgAttendance: stat.classCount > 0 ? stat.totalAttendance / stat.classCount : 0
      }))
      .sort((a, b) => b.avgAttendance - a.avgAttendance)
      .slice(0, 10);

    return result;
  }, [filteredPayrollData]);

  // Get classes for selected instructor
  const selectedInstructorData = useMemo(() => {
    if (!selectedInstructor) return null;
    return chartData.find(d => d.name === selectedInstructor);
  }, [selectedInstructor, chartData]);

  // Sort the classes based on sortConfig
  const sortedClasses = useMemo(() => {
    if (!selectedInstructorData) return [];

    const sorted = [...selectedInstructorData.classes].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case 'className':
          aVal = a.className.toLowerCase();
          bVal = b.className.toLowerCase();
          break;
        case 'classDate':
          aVal = new Date(a.classDate);
          bVal = new Date(b.classDate);
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
  }, [selectedInstructorData, sortConfig]);

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

  // Handle bar click
  const handleBarClick = (data) => {
    if (data && data.name) {
      setSelectedInstructor(prev => prev === data.name ? null : data.name);
    }
  };

  // Handle clicking on X-axis label
  const handleXAxisClick = (e) => {
    if (e && e.value) {
      setSelectedInstructor(prev => prev === e.value ? null : e.value);
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Top 10 Instructors by Average Class Attendance</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top 10 Instructors by Average Class Attendance</h3>
      <p className="chart-subtitle">Click on a bar to view class details</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          onClick={(e) => e && e.activePayload && handleBarClick(e.activePayload[0].payload)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ cursor: 'pointer' }}
            onClick={handleXAxisClick}
          />
          <YAxis
            label={{ value: 'Avg Attendance', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '10px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>Instructor: {data.name}</p>
                    <p style={{ margin: '0 0 5px', color: '#667eea' }}>Avg Attendance: {data.avgAttendance.toFixed(1)}</p>
                    <p style={{ margin: 0, color: '#666' }}># of Classes: {data.classCount}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="avgAttendance"
            name="Avg Attendance"
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === selectedInstructor ? '#ff7300' : '#667eea'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selectedInstructorData && (
        <div className="instructor-detail-table">
          <h4>
            Classes for {selectedInstructor}
            <button
              className="close-detail-btn"
              onClick={() => setSelectedInstructor(null)}
            >
              Close
            </button>
          </h4>
          <p className="detail-summary">
            {selectedInstructorData.classCount} classes |
            Total Attendance: {selectedInstructorData.totalAttendance} |
            Average: {selectedInstructorData.avgAttendance.toFixed(1)}
          </p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('className')} className="sortable-header">
                    Class Name{getSortIndicator('className')}
                  </th>
                  <th onClick={() => handleSort('classDate')} className="sortable-header">
                    Class Date{getSortIndicator('classDate')}
                  </th>
                  <th onClick={() => handleSort('attendance')} className="sortable-header">
                    Attendance{getSortIndicator('attendance')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map((cls, idx) => (
                  <tr key={idx}>
                    <td>{decodeHtmlEntities(cls.className)}</td>
                    <td>{cls.classDate}</td>
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

export default TopAttendanceChart;
