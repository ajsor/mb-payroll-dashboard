import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const AttendanceTrendsChart = () => {
  const { filteredPayrollData } = usePayroll();

  // Aggregate attendance by month
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    const monthlyData = {};

    filteredPayrollData.forEach(row => {
      if (!row.classDate) return;

      const date = new Date(row.classDate);
      if (isNaN(date.getTime())) return;

      // Create month key (YYYY-MM)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const attendance = row.staffPaid || 0;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 };
      }

      monthlyData[monthKey].total += attendance;
      monthlyData[monthKey].count++;
    });

    // Convert to array and calculate averages
    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        avgAttendance: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
        totalAttendance: data.total
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return result;
  }, [filteredPayrollData]);

  // Format month for display
  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Attendance Trends</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Attendance Trends</h3>
      <p className="chart-subtitle">Average attendance per class by month</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            label={{ value: 'Avg Attendance', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            labelFormatter={(label) => formatMonth(label)}
            formatter={(value, name) => {
              if (name === 'avgAttendance') return [value, 'Avg Attendance'];
              return [value, name];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgAttendance"
            stroke="#667eea"
            strokeWidth={2}
            dot={{ fill: '#667eea', strokeWidth: 2 }}
            name="Avg Attendance"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceTrendsChart;
