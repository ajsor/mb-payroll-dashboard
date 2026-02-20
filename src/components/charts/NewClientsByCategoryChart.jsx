import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const COLORS = [
  '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9',
  '#14b8a6', '#22c55e', '#84cc16', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#d946ef',
  '#a855f7', '#7c3aed', '#4f46e5', '#2563eb'
];

const NewClientsByCategoryChart = () => {
  const { filteredFirstVisitData } = usePayroll();

  const chartData = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) return [];

    // Count by service category
    const categoryCounts = {};

    filteredFirstVisitData.forEach(client => {
      const category = client.serviceCategory || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const total = filteredFirstVisitData.length;

    // Convert to array and sort by count descending
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category: category.replace(' Classes', '').replace(' AM', ' (AM)'), // Shorten labels
        fullCategory: category,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredFirstVisitData]);

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">New Clients by Service Category</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  // Calculate dynamic height based on number of categories
  const chartHeight = Math.max(350, chartData.length * 35 + 80);

  return (
    <div className="chart-container">
      <h3 className="chart-title">New Clients by Service Category</h3>
      <p className="chart-subtitle">Which services attract first-time clients</p>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11 }}
            width={130}
          />
          <Tooltip
            formatter={(value, name, props) => [
              `${value} clients (${props.payload.percentage}%)`,
              props.payload.fullCategory
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NewClientsByCategoryChart;
