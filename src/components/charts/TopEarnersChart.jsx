import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';
import { formatCurrency } from '../../utils/dataProcessor';
import {
  chartContainer,
  chartTitle,
  chartSubtitle,
  chartEmpty,
  detailTable,
  detailTableHeading,
  closeDetailBtn,
  detailSummary,
  tableWrapper,
  detailTableEl,
  detailTh,
  detailTd,
  detailTdLast,
  detailRowHover,
  sortableHeader
} from '../../styles/chartClasses';

// Decode HTML entities like &#8482; to their actual symbols
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const TopEarnersChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'classDate', direction: 'desc' });

  // Calculate total earnings per instructor
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    const instructorStats = {};

    filteredPayrollData.forEach(row => {
      if (!row.instructorName) return;

      if (!instructorStats[row.instructorName]) {
        instructorStats[row.instructorName] = {
          name: decodeHtmlEntities(row.instructorName),
          totalEarnings: 0,
          sessionCount: 0,
          classes: []
        };
      }

      const earnings = row.earnings || 0;
      instructorStats[row.instructorName].totalEarnings += earnings;
      instructorStats[row.instructorName].sessionCount++;
      instructorStats[row.instructorName].classes.push({
        className: row.className || 'Unknown',
        classDate: row.classDate || 'Unknown',
        earnings: earnings
      });
    });

    // Sort by highest earnings and take top 10
    const result = Object.values(instructorStats)
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
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
        case 'earnings':
          aVal = a.earnings;
          bVal = b.earnings;
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

  if (chartData.length === 0) {
    return (
      <div className={chartContainer}>
        <h3 className={chartTitle}>Top 10 Earners</h3>
        <div className={chartEmpty}>No data available</div>
      </div>
    );
  }

  return (
    <div className={chartContainer}>
      <h3 className={chartTitle}>Top 10 Earners</h3>
      <p className={chartSubtitle}>Click on a bar to view class details</p>
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
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Total Earnings', angle: -90, position: 'insideLeft' }}
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
                    <p style={{ margin: '0 0 5px', color: '#667eea' }}>Total Earnings: {formatCurrency(data.totalEarnings)}</p>
                    <p style={{ margin: 0, color: '#666' }}># of Sessions: {data.sessionCount}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="totalEarnings"
            name="Total Earnings"
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === selectedInstructor ? '#ff7300' : '#764ba2'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selectedInstructorData && (
        <div className={detailTable}>
          <h4 className={detailTableHeading}>
            Sessions for {selectedInstructor}
            <button
              className={closeDetailBtn}
              onClick={() => setSelectedInstructor(null)}
            >
              Close
            </button>
          </h4>
          <p className={detailSummary}>
            {selectedInstructorData.sessionCount} sessions |
            Total Earnings: {formatCurrency(selectedInstructorData.totalEarnings)}
          </p>
          <div className={tableWrapper}>
            <table className={detailTableEl}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('classDate')} className={`${detailTh} ${sortableHeader}`}>
                    Class Date{getSortIndicator('classDate')}
                  </th>
                  <th onClick={() => handleSort('className')} className={`${detailTh} ${sortableHeader}`}>
                    Class Name{getSortIndicator('className')}
                  </th>
                  <th onClick={() => handleSort('earnings')} className={`${detailTh} ${sortableHeader}`}>
                    Earnings{getSortIndicator('earnings')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map((cls, idx) => (
                  <tr key={idx} className={detailRowHover}>
                    <td className={detailTd}>{cls.classDate}</td>
                    <td className={detailTd}>{decodeHtmlEntities(cls.className)}</td>
                    <td className={detailTdLast}>{formatCurrency(cls.earnings)}</td>
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

export default TopEarnersChart;
