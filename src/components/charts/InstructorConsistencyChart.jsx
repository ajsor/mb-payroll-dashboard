import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

// Decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const InstructorConsistencyChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'classDate', direction: 'desc' });

  // Calculate average attendance and standard deviation per instructor
  const { chartData, avgLine } = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      return { chartData: [], avgLine: 0 };
    }

    const instructorStats = {};

    filteredPayrollData.forEach(row => {
      if (!row.instructorName) return;

      if (!instructorStats[row.instructorName]) {
        instructorStats[row.instructorName] = {
          name: decodeHtmlEntities(row.instructorName),
          attendances: [],
          classes: []
        };
      }

      const attendance = row.staffPaid || 0;
      instructorStats[row.instructorName].attendances.push(attendance);
      instructorStats[row.instructorName].classes.push({
        classDate: row.classDate || 'Unknown',
        className: decodeHtmlEntities(row.className) || 'Unknown',
        attendance: attendance
      });
    });

    // Calculate stats
    const result = Object.values(instructorStats)
      .filter(stat => stat.attendances.length >= 3) // Need at least 3 classes for meaningful variance
      .map(stat => {
        const avg = stat.attendances.reduce((a, b) => a + b, 0) / stat.attendances.length;
        const variance = stat.attendances.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / stat.attendances.length;
        const stdDev = Math.sqrt(variance);
        const cv = avg > 0 ? (stdDev / avg) * 100 : 0; // Coefficient of variation as percentage

        return {
          name: stat.name,
          avgAttendance: Math.round(avg * 10) / 10,
          consistency: Math.round((100 - Math.min(cv, 100)) * 10) / 10, // Higher = more consistent
          stdDev: Math.round(stdDev * 10) / 10,
          sessionCount: stat.attendances.length,
          classes: stat.classes
        };
      })
      .sort((a, b) => b.avgAttendance - a.avgAttendance);

    const overallAvg = result.length > 0
      ? result.reduce((sum, d) => sum + d.avgAttendance, 0) / result.length
      : 0;

    return { chartData: result, avgLine: overallAvg };
  }, [filteredPayrollData]);

  // Get classes for selected instructor
  const selectedInstructorData = useMemo(() => {
    if (!selectedInstructor) return null;
    return chartData.find(d => d.name === selectedInstructor);
  }, [selectedInstructor, chartData]);

  // Sort classes
  const sortedClasses = useMemo(() => {
    if (!selectedInstructorData) return [];
    return [...selectedInstructorData.classes].sort((a, b) => {
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
  }, [selectedInstructorData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Instructor Consistency</h3>
        <div className="chart-empty">No data available (need at least 3 sessions per instructor)</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Instructor Consistency</h3>
      <p className="chart-subtitle">X: Avg Attendance | Y: Consistency Score (higher = more consistent) | Click to view details</p>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="avgAttendance"
            name="Avg Attendance"
            type="number"
            label={{ value: 'Avg Attendance', position: 'bottom', offset: 0 }}
          />
          <YAxis
            dataKey="consistency"
            name="Consistency"
            type="number"
            domain={[0, 100]}
            label={{ value: 'Consistency %', angle: -90, position: 'insideLeft' }}
          />
          <ReferenceLine x={avgLine} stroke="#999" strokeDasharray="5 5" label={{ value: 'Avg', position: 'top' }} />
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
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{data.name}</p>
                    <p style={{ margin: '0 0 3px', color: '#667eea' }}>Avg Attendance: {data.avgAttendance}</p>
                    <p style={{ margin: '0 0 3px', color: '#2e7d32' }}>Consistency: {data.consistency}%</p>
                    <p style={{ margin: '0 0 3px', color: '#666' }}>Std Dev: {data.stdDev}</p>
                    <p style={{ margin: 0, color: '#666' }}>Sessions: {data.sessionCount}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter
            data={chartData}
            cursor="pointer"
            onClick={(data) => setSelectedInstructor(prev => prev === data.name ? null : data.name)}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === selectedInstructor ? '#ff7300' : entry.consistency >= 70 ? '#2e7d32' : entry.consistency >= 50 ? '#f57c00' : '#d32f2f'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {selectedInstructorData && (
        <div className="instructor-detail-table">
          <h4>
            {selectedInstructor} - Consistency: {selectedInstructorData.consistency}%
            <button className="close-detail-btn" onClick={() => setSelectedInstructor(null)}>Close</button>
          </h4>
          <p className="detail-summary">
            {selectedInstructorData.sessionCount} sessions |
            Avg: {selectedInstructorData.avgAttendance} |
            Std Dev: {selectedInstructorData.stdDev}
          </p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('classDate')} className="sortable-header">Date{getSortIndicator('classDate')}</th>
                  <th onClick={() => handleSort('className')} className="sortable-header">Class{getSortIndicator('className')}</th>
                  <th onClick={() => handleSort('attendance')} className="sortable-header">Attendance{getSortIndicator('attendance')}</th>
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

export default InstructorConsistencyChart;
