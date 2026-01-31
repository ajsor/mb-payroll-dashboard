import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';
import { formatCurrency } from '../../utils/dataProcessor';

// Decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const COLORS = ['#667eea', '#2e7d32', '#ff7300', '#d32f2f'];

const InstructorComparisonChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [selectedInstructors, setSelectedInstructors] = useState([]);

  // Calculate stats for all instructors
  const { instructorList, instructorStats } = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      return { instructorList: [], instructorStats: {} };
    }

    const stats = {};

    filteredPayrollData.forEach(row => {
      if (!row.instructorName) return;

      if (!stats[row.instructorName]) {
        stats[row.instructorName] = {
          name: decodeHtmlEntities(row.instructorName),
          rawName: row.instructorName,
          sessions: 0,
          totalAttendance: 0,
          totalEarnings: 0,
          attendances: [],
          classes: new Set()
        };
      }

      const attendance = row.staffPaid || 0;
      stats[row.instructorName].sessions++;
      stats[row.instructorName].totalAttendance += attendance;
      stats[row.instructorName].totalEarnings += row.earnings || 0;
      stats[row.instructorName].attendances.push(attendance);
      if (row.className) {
        stats[row.instructorName].classes.add(row.className);
      }
    });

    // Calculate derived metrics
    Object.values(stats).forEach(stat => {
      stat.avgAttendance = stat.sessions > 0 ? stat.totalAttendance / stat.sessions : 0;
      stat.uniqueClasses = stat.classes.size;

      // Calculate consistency (inverse of coefficient of variation)
      if (stat.attendances.length >= 2) {
        const mean = stat.avgAttendance;
        const variance = stat.attendances.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stat.attendances.length;
        const stdDev = Math.sqrt(variance);
        const cv = mean > 0 ? (stdDev / mean) * 100 : 0;
        stat.consistency = Math.max(0, 100 - cv);
      } else {
        stat.consistency = 50;
      }
    });

    // Sort by sessions for dropdown
    const instructorList = Object.values(stats)
      .filter(s => s.sessions >= 3)
      .sort((a, b) => b.sessions - a.sessions);

    return { instructorList, instructorStats: stats };
  }, [filteredPayrollData]);

  // Get comparison data for selected instructors
  const comparisonData = useMemo(() => {
    if (selectedInstructors.length === 0) return null;

    const selected = selectedInstructors
      .map(name => instructorStats[name])
      .filter(Boolean);

    if (selected.length === 0) return null;

    // Bar chart data
    const barData = [
      {
        metric: 'Avg Attendance',
        ...selected.reduce((acc, s, i) => ({ ...acc, [s.name]: Math.round(s.avgAttendance * 10) / 10 }), {})
      },
      {
        metric: 'Sessions',
        ...selected.reduce((acc, s, i) => ({ ...acc, [s.name]: s.sessions }), {})
      },
      {
        metric: 'Unique Classes',
        ...selected.reduce((acc, s, i) => ({ ...acc, [s.name]: s.uniqueClasses }), {})
      }
    ];

    // Radar chart data (normalized to 0-100)
    const maxSessions = Math.max(...selected.map(s => s.sessions));
    const maxAttendance = Math.max(...selected.map(s => s.avgAttendance));
    const maxEarnings = Math.max(...selected.map(s => s.totalEarnings));
    const maxClasses = Math.max(...selected.map(s => s.uniqueClasses));

    const radarData = [
      {
        metric: 'Sessions',
        fullMark: 100,
        ...selected.reduce((acc, s) => ({ ...acc, [s.name]: Math.round((s.sessions / maxSessions) * 100) }), {})
      },
      {
        metric: 'Avg Attendance',
        fullMark: 100,
        ...selected.reduce((acc, s) => ({ ...acc, [s.name]: Math.round((s.avgAttendance / maxAttendance) * 100) }), {})
      },
      {
        metric: 'Earnings',
        fullMark: 100,
        ...selected.reduce((acc, s) => ({ ...acc, [s.name]: Math.round((s.totalEarnings / maxEarnings) * 100) }), {})
      },
      {
        metric: 'Consistency',
        fullMark: 100,
        ...selected.reduce((acc, s) => ({ ...acc, [s.name]: Math.round(s.consistency) }), {})
      },
      {
        metric: 'Class Variety',
        fullMark: 100,
        ...selected.reduce((acc, s) => ({ ...acc, [s.name]: Math.round((s.uniqueClasses / maxClasses) * 100) }), {})
      }
    ];

    // Summary table data
    const summaryData = selected.map(s => ({
      name: s.name,
      sessions: s.sessions,
      avgAttendance: Math.round(s.avgAttendance * 10) / 10,
      totalEarnings: s.totalEarnings,
      consistency: Math.round(s.consistency),
      uniqueClasses: s.uniqueClasses
    }));

    return { barData, radarData, summaryData, selected };
  }, [selectedInstructors, instructorStats]);

  const handleInstructorToggle = (rawName) => {
    setSelectedInstructors(prev => {
      if (prev.includes(rawName)) {
        return prev.filter(n => n !== rawName);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), rawName]; // Remove oldest, add new
      }
      return [...prev, rawName];
    });
  };

  if (instructorList.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Instructor Comparison</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Instructor Comparison</h3>
      <p className="chart-subtitle">Select 2-4 instructors to compare (click to toggle)</p>

      <div className="comparison-instructor-selector">
        <div className="instructor-chips">
          {instructorList.slice(0, 20).map((instructor, idx) => (
            <button
              key={instructor.rawName}
              className={`instructor-chip ${selectedInstructors.includes(instructor.rawName) ? 'selected' : ''}`}
              style={selectedInstructors.includes(instructor.rawName) ? {
                backgroundColor: COLORS[selectedInstructors.indexOf(instructor.rawName) % COLORS.length],
                borderColor: COLORS[selectedInstructors.indexOf(instructor.rawName) % COLORS.length]
              } : {}}
              onClick={() => handleInstructorToggle(instructor.rawName)}
            >
              {instructor.name}
            </button>
          ))}
          {instructorList.length > 20 && (
            <span className="more-instructors">+{instructorList.length - 20} more</span>
          )}
        </div>
      </div>

      {comparisonData && comparisonData.selected.length >= 2 ? (
        <div className="comparison-charts">
          <div className="comparison-section">
            <h4>Performance Radar</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={comparisonData.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                {comparisonData.selected.map((s, idx) => (
                  <Radar
                    key={s.name}
                    name={s.name}
                    dataKey={s.name}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={COLORS[idx % COLORS.length]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="comparison-section">
            <h4>Summary Comparison</h4>
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Instructor</th>
                    <th>Sessions</th>
                    <th>Avg Attendance</th>
                    <th>Total Earnings</th>
                    <th>Consistency</th>
                    <th>Classes Taught</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.summaryData.map((row, idx) => (
                    <tr key={row.name} style={{ borderLeft: `4px solid ${COLORS[idx % COLORS.length]}` }}>
                      <td style={{ fontWeight: 600 }}>{row.name}</td>
                      <td>{row.sessions}</td>
                      <td>{row.avgAttendance}</td>
                      <td>{formatCurrency(row.totalEarnings)}</td>
                      <td>{row.consistency}%</td>
                      <td>{row.uniqueClasses}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="comparison-placeholder">
          <p>Select at least 2 instructors above to see comparison</p>
        </div>
      )}
    </div>
  );
};

export default InstructorComparisonChart;
