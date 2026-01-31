import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Parse time string to get hour
const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;

  const str = String(timeStr).trim();

  // Handle HH:MM format
  const colonMatch = str.match(/^(\d{1,2}):(\d{2})/);
  if (colonMatch) {
    let hour = parseInt(colonMatch[1], 10);
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

// Format hour for display
const formatHour = (hour) => {
  if (hour === 0 || hour === 12) return `12 ${hour === 0 ? 'AM' : 'PM'}`;
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

const PeakHoursChart = () => {
  const { filteredPayrollData } = usePayroll();

  // Calculate average attendance by hour and day
  const { hourlyData, dailyData, overallAvg, recommendations } = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      return { hourlyData: [], dailyData: [], overallAvg: 0, recommendations: [] };
    }

    const hourStats = {};
    const dayStats = {};
    let totalAttendance = 0;
    let totalSessions = 0;

    filteredPayrollData.forEach(row => {
      if (!row.classDate || !row.classTime) return;

      const date = new Date(row.classDate);
      if (isNaN(date.getTime())) return;

      const dayOfWeek = date.getDay();
      const hour = parseTimeToHour(row.classTime);
      const attendance = row.staffPaid || 0;

      if (hour === null || hour < 5 || hour > 21) return;

      totalAttendance += attendance;
      totalSessions++;

      // Hour stats
      if (!hourStats[hour]) {
        hourStats[hour] = { total: 0, count: 0 };
      }
      hourStats[hour].total += attendance;
      hourStats[hour].count++;

      // Day stats
      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { total: 0, count: 0 };
      }
      dayStats[dayOfWeek].total += attendance;
      dayStats[dayOfWeek].count++;
    });

    const overallAvg = totalSessions > 0 ? totalAttendance / totalSessions : 0;

    // Process hourly data
    const hourlyData = Object.entries(hourStats)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        label: formatHour(parseInt(hour)),
        avgAttendance: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
        sessions: stats.count,
        aboveAvg: (stats.total / stats.count) > overallAvg
      }))
      .sort((a, b) => a.hour - b.hour);

    // Process daily data
    const dailyData = DAYS_OF_WEEK.map((name, index) => {
      const stats = dayStats[index] || { total: 0, count: 0 };
      return {
        day: name.slice(0, 3),
        fullDay: name,
        avgAttendance: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
        sessions: stats.count,
        aboveAvg: stats.count > 0 && (stats.total / stats.count) > overallAvg
      };
    });

    // Generate recommendations
    const recommendations = [];

    // Best hours
    const sortedHours = [...hourlyData].sort((a, b) => b.avgAttendance - a.avgAttendance);
    if (sortedHours.length >= 3) {
      const topHours = sortedHours.slice(0, 3).map(h => h.label).join(', ');
      recommendations.push(`Peak hours: ${topHours}`);
    }

    // Best days
    const sortedDays = [...dailyData].filter(d => d.sessions > 0).sort((a, b) => b.avgAttendance - a.avgAttendance);
    if (sortedDays.length >= 2) {
      const topDays = sortedDays.slice(0, 2).map(d => d.fullDay).join(' and ');
      recommendations.push(`Best days: ${topDays}`);
    }

    // Worst times to avoid
    const worstHours = sortedHours.filter(h => h.sessions >= 5).slice(-2);
    if (worstHours.length > 0) {
      const avoid = worstHours.map(h => h.label).join(', ');
      recommendations.push(`Consider avoiding: ${avoid}`);
    }

    return { hourlyData, dailyData, overallAvg: Math.round(overallAvg * 10) / 10, recommendations };
  }, [filteredPayrollData]);

  if (hourlyData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Peak Hours Analysis</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Peak Hours Analysis</h3>
      <p className="chart-subtitle">Optimal scheduling times based on average attendance (overall avg: {overallAvg})</p>

      {recommendations.length > 0 && (
        <div className="insights-recommendations">
          {recommendations.map((rec, idx) => (
            <span key={idx} className="recommendation-badge">{rec}</span>
          ))}
        </div>
      )}

      <div className="peak-hours-charts">
        <div className="peak-hours-section">
          <h4>By Hour of Day</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <ReferenceLine y={overallAvg} stroke="#ff7300" strokeDasharray="5 5" label={{ value: 'Avg', position: 'right', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{data.label}</p>
                        <p style={{ margin: '0 0 2px', color: data.aboveAvg ? '#2e7d32' : '#d32f2f' }}>
                          Avg Attendance: {data.avgAttendance}
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                          {data.sessions} sessions
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgAttendance">
                {hourlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.aboveAvg ? '#2e7d32' : '#90a4ae'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="peak-hours-section">
          <h4>By Day of Week</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ReferenceLine y={overallAvg} stroke="#ff7300" strokeDasharray="5 5" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{data.fullDay}</p>
                        <p style={{ margin: '0 0 2px', color: data.aboveAvg ? '#2e7d32' : '#d32f2f' }}>
                          Avg Attendance: {data.avgAttendance}
                        </p>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                          {data.sessions} sessions
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgAttendance">
                {dailyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.aboveAvg ? '#2e7d32' : '#90a4ae'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PeakHoursChart;
