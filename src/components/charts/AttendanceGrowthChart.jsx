import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

// Decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const AttendanceGrowthChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [viewType, setViewType] = useState('instructors'); // 'instructors' or 'classes'

  // Calculate growth rate for instructors or classes
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    // Group data by month first
    const monthlyData = {};

    filteredPayrollData.forEach(row => {
      if (!row.classDate) return;
      const key = viewType === 'instructors' ? row.instructorName : row.className;
      if (!key) return;

      const date = new Date(row.classDate);
      if (isNaN(date.getTime())) return;

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {};
      }
      if (!monthlyData[key][monthKey]) {
        monthlyData[key][monthKey] = { total: 0, count: 0 };
      }

      monthlyData[key][monthKey].total += row.staffPaid || 0;
      monthlyData[key][monthKey].count++;
    });

    // Calculate growth for each entity
    const results = [];

    Object.entries(monthlyData).forEach(([name, months]) => {
      const sortedMonths = Object.keys(months).sort();
      if (sortedMonths.length < 2) return; // Need at least 2 months

      // Get first half and second half averages
      const midpoint = Math.floor(sortedMonths.length / 2);
      const firstHalf = sortedMonths.slice(0, midpoint);
      const secondHalf = sortedMonths.slice(midpoint);

      const firstAvg = firstHalf.reduce((sum, m) => sum + (months[m].total / months[m].count), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, m) => sum + (months[m].total / months[m].count), 0) / secondHalf.length;

      const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
      const totalSessions = Object.values(months).reduce((sum, m) => sum + m.count, 0);

      if (totalSessions >= 5) { // Minimum sessions for meaningful data
        const decodedName = decodeHtmlEntities(name);
        results.push({
          name: decodedName.length > 20 ? decodedName.substring(0, 20) + '...' : decodedName,
          fullName: decodedName,
          growthRate: Math.round(growthRate * 10) / 10,
          firstAvg: Math.round(firstAvg * 10) / 10,
          secondAvg: Math.round(secondAvg * 10) / 10,
          sessions: totalSessions
        });
      }
    });

    // Sort by absolute growth rate and take top/bottom
    results.sort((a, b) => b.growthRate - a.growthRate);

    // Take top 5 growing and top 5 declining
    const growing = results.filter(r => r.growthRate > 0).slice(0, 5);
    const declining = results.filter(r => r.growthRate < 0).slice(-5).reverse();

    return [...growing, ...declining];
  }, [filteredPayrollData, viewType]);

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Attendance Growth/Decline</h3>
        <div className="chart-empty">Not enough data (need multiple months)</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Attendance Growth/Decline</h3>
      <div className="chart-controls">
        <label>View: </label>
        <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
          <option value="instructors">Instructors</option>
          <option value="classes">Classes</option>
        </select>
      </div>
      <p className="chart-subtitle">Top 5 growing and declining (comparing first half vs second half of period)</p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={['dataMin - 10', 'dataMax + 10']}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={90}
            tick={{ fontSize: 11 }}
          />
          <ReferenceLine x={0} stroke="#666" />
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
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{data.fullName}</p>
                    <p style={{ margin: '0 0 3px', color: data.growthRate >= 0 ? '#2e7d32' : '#d32f2f' }}>
                      Growth: {data.growthRate}%
                    </p>
                    <p style={{ margin: '0 0 3px', color: '#666' }}>First Half Avg: {data.firstAvg}</p>
                    <p style={{ margin: '0 0 3px', color: '#666' }}>Second Half Avg: {data.secondAvg}</p>
                    <p style={{ margin: 0, color: '#666' }}>Total Sessions: {data.sessions}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="growthRate">
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.growthRate >= 0 ? '#2e7d32' : '#d32f2f'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceGrowthChart;
