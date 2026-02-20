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
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6'
];

const ReferralSourceChart = () => {
  const { filteredFirstVisitData } = usePayroll();

  const chartData = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) return [];

    // Count by normalized referral type
    const referralCounts = {};

    filteredFirstVisitData.forEach(client => {
      const referral = client.referralTypeNormalized || 'Unknown';
      referralCounts[referral] = (referralCounts[referral] || 0) + 1;
    });

    const total = filteredFirstVisitData.length;

    // Convert to array and sort by count descending
    return Object.entries(referralCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredFirstVisitData]);

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Referral Sources</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Referral Sources</h3>
      <p className="chart-subtitle">How new clients discover you</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="source"
            tick={{ fontSize: 12 }}
            width={110}
          />
          <Tooltip
            formatter={(value, name, props) => [
              `${value} clients (${props.payload.percentage}%)`,
              'Count'
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

export default ReferralSourceChart;
