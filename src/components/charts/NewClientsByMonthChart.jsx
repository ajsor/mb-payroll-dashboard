import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const NewClientsByMonthChart = () => {
  const { filteredFirstVisitData } = usePayroll();

  const chartData = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) return [];

    // Group by month
    const monthlyData = {};

    filteredFirstVisitData.forEach(client => {
      if (!client.firstVisitDate) return;

      const date = new Date(client.firstVisitDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          count: 0
        };
      }
      monthlyData[monthKey].count++;
    });

    // Sort by month and format labels
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => {
        const [year, month] = item.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          ...item,
          label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        };
      });
  }, [filteredFirstVisitData]);

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">New Clients by Month</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">New Clients by Month</h3>
      <p className="chart-subtitle">First-time client acquisition over time</p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={Math.floor(chartData.length / 12)}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [value, 'New Clients']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Bar
            dataKey="count"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NewClientsByMonthChart;
