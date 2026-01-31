import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#667eea', '#764ba2', '#2e7d32', '#d32f2f', '#f57c00', '#0288d1', '#7b1fa2', '#c2185b'];

const YearOverYearChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [metric, setMetric] = useState('attendance'); // 'attendance', 'sessions', 'payroll'

  // Aggregate data by year and month
  const { chartData, years } = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      return { chartData: [], years: [] };
    }

    const yearMonthData = {};
    const yearsSet = new Set();

    filteredPayrollData.forEach(row => {
      if (!row.classDate) return;

      const date = new Date(row.classDate);
      if (isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11

      yearsSet.add(year);

      const key = month; // Group by month (0-11)
      if (!yearMonthData[key]) {
        yearMonthData[key] = {};
      }
      if (!yearMonthData[key][year]) {
        yearMonthData[key][year] = { totalAttendance: 0, sessions: 0, totalPayroll: 0 };
      }

      yearMonthData[key][year].totalAttendance += row.staffPaid || 0;
      yearMonthData[key][year].sessions++;
      yearMonthData[key][year].totalPayroll += row.earnings || 0;
    });

    const sortedYears = Array.from(yearsSet).sort();

    // Build chart data array
    const result = MONTHS.map((monthName, monthIndex) => {
      const dataPoint = { month: monthName };

      sortedYears.forEach(year => {
        const yearData = yearMonthData[monthIndex]?.[year];
        if (yearData) {
          if (metric === 'attendance') {
            dataPoint[year] = yearData.sessions > 0
              ? Math.round((yearData.totalAttendance / yearData.sessions) * 10) / 10
              : 0;
          } else if (metric === 'sessions') {
            dataPoint[year] = yearData.sessions;
          } else if (metric === 'payroll') {
            dataPoint[year] = Math.round(yearData.totalPayroll * 100) / 100;
          }
        }
      });

      return dataPoint;
    });

    return { chartData: result, years: sortedYears };
  }, [filteredPayrollData, metric]);

  const getYAxisLabel = () => {
    switch (metric) {
      case 'attendance': return 'Avg Attendance';
      case 'sessions': return 'Sessions';
      case 'payroll': return 'Payroll ($)';
      default: return '';
    }
  };

  const formatTooltipValue = (value) => {
    if (metric === 'payroll') {
      return `$${value.toLocaleString()}`;
    }
    return value;
  };

  if (chartData.length === 0 || years.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Year-over-Year Comparison</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Year-over-Year Comparison</h3>
      <div className="chart-controls">
        <label>Metric: </label>
        <select value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="attendance">Avg Attendance</option>
          <option value="sessions">Sessions</option>
          <option value="payroll">Payroll</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => metric === 'payroll' ? `$${(value / 1000).toFixed(0)}k` : value}
          />
          <Tooltip
            formatter={(value, name) => [formatTooltipValue(value), name]}
          />
          <Legend />
          {years.map((year, index) => (
            <Line
              key={year}
              type="monotone"
              dataKey={year}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2 }}
              name={year.toString()}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YearOverYearChart;
