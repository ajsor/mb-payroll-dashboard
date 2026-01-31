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

const PopularClassesChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [selectedClass, setSelectedClass] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'classDate', direction: 'desc' });

  // Calculate average attendance per class
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    const classStats = {};

    filteredPayrollData.forEach(row => {
      if (!row.className) return;

      if (!classStats[row.className]) {
        classStats[row.className] = {
          name: row.className,
          totalAttendance: 0,
          sessionCount: 0,
          sessions: []
        };
      }

      const attendance = row.staffPaid || 0;
      classStats[row.className].totalAttendance += attendance;
      classStats[row.className].sessionCount++;
      classStats[row.className].sessions.push({
        classDate: row.classDate || 'Unknown',
        instructorName: decodeHtmlEntities(row.instructorName) || 'Unknown',
        attendance: attendance
      });
    });

    // Calculate averages, filter to 40+ sessions, and sort by highest average attendance
    const result = Object.values(classStats)
      .map(stat => ({
        ...stat,
        avgAttendance: stat.sessionCount > 0 ? stat.totalAttendance / stat.sessionCount : 0
      }))
      .filter(stat => stat.sessionCount > 40)
      .sort((a, b) => b.avgAttendance - a.avgAttendance)
      .slice(0, 10);

    return result;
  }, [filteredPayrollData]);

  // Get sessions for selected class
  const selectedClassData = useMemo(() => {
    if (!selectedClass) return null;
    return chartData.find(d => d.name === selectedClass);
  }, [selectedClass, chartData]);

  // Sort the sessions based on sortConfig
  const sortedSessions = useMemo(() => {
    if (!selectedClassData) return [];

    const sorted = [...selectedClassData.sessions].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case 'classDate':
          aVal = new Date(a.classDate);
          bVal = new Date(b.classDate);
          break;
        case 'instructorName':
          aVal = a.instructorName.toLowerCase();
          bVal = b.instructorName.toLowerCase();
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
  }, [selectedClassData, sortConfig]);

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
      setSelectedClass(prev => prev === data.name ? null : data.name);
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Top 10 Most Popular Classes</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top 10 Most Popular Classes</h3>
      <p className="chart-subtitle">Ranked by average attendance (w/40+ sessions) - Click on a bar to view sessions</p>
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
            tickFormatter={(value) => decodeHtmlEntities(value).substring(0, 20) + (value.length > 20 ? '...' : '')}
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
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>Class: {decodeHtmlEntities(data.name)}</p>
                    <p style={{ margin: '0 0 5px', color: '#667eea' }}>Avg Attendance: {data.avgAttendance.toFixed(1)}</p>
                    <p style={{ margin: 0, color: '#666' }}># of Sessions: {data.sessionCount}</p>
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
                fill={entry.name === selectedClass ? '#ff7300' : '#2e7d32'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selectedClassData && (
        <div className="instructor-detail-table">
          <h4>
            Sessions for {decodeHtmlEntities(selectedClass)}
            <button
              className="close-detail-btn"
              onClick={() => setSelectedClass(null)}
            >
              Close
            </button>
          </h4>
          <p className="detail-summary">
            {selectedClassData.sessionCount} sessions |
            Total Attendance: {selectedClassData.totalAttendance} |
            Average: {selectedClassData.avgAttendance.toFixed(1)}
          </p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('classDate')} className="sortable-header">
                    Class Date{getSortIndicator('classDate')}
                  </th>
                  <th onClick={() => handleSort('instructorName')} className="sortable-header">
                    Instructor{getSortIndicator('instructorName')}
                  </th>
                  <th onClick={() => handleSort('attendance')} className="sortable-header">
                    Attendance{getSortIndicator('attendance')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSessions.map((session, idx) => (
                  <tr key={idx}>
                    <td>{session.classDate}</td>
                    <td>{session.instructorName}</td>
                    <td>{session.attendance}</td>
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

export default PopularClassesChart;
