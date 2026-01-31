import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';
import { formatCurrency } from '../../utils/dataProcessor';

const PayrollByMonthChart = () => {
  const { filteredPayrollData } = usePayroll();

  // Aggregate payroll by month
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    const monthlyData = {};

    filteredPayrollData.forEach(row => {
      if (!row.classDate) return;

      const date = new Date(row.classDate);
      if (isNaN(date.getTime())) return;

      // Create month key (YYYY-MM)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const earnings = row.earnings || 0;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }

      monthlyData[monthKey] += earnings;
    });

    // Convert to array
    const result = Object.entries(monthlyData)
      .map(([month, payroll]) => ({
        month,
        payroll: Math.round(payroll * 100) / 100
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
        <h3 className="chart-title">Payroll by Month</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Payroll by Month</h3>
      <p className="chart-subtitle">Total payroll per month</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Payroll', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            labelFormatter={(label) => formatMonth(label)}
            formatter={(value) => [formatCurrency(value), 'Payroll']}
          />
          <Bar
            dataKey="payroll"
            fill="#d32f2f"
            name="Payroll"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PayrollByMonthChart;
