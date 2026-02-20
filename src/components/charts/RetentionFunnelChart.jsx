import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const RetentionFunnelChart = () => {
  const { filteredFirstVisitData } = usePayroll();

  const chartData = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) return [];

    // Define retention buckets
    const buckets = [
      { label: '0 visits', min: 0, max: 0, count: 0, color: '#ef4444' },
      { label: '1-5 visits', min: 1, max: 5, count: 0, color: '#f97316' },
      { label: '6-10 visits', min: 6, max: 10, count: 0, color: '#eab308' },
      { label: '11-25 visits', min: 11, max: 25, count: 0, color: '#84cc16' },
      { label: '26-50 visits', min: 26, max: 50, count: 0, color: '#22c55e' },
      { label: '51+ visits', min: 51, max: Infinity, count: 0, color: '#10b981' }
    ];

    filteredFirstVisitData.forEach(client => {
      const visits = client.visitsSinceFirst || 0;
      for (const bucket of buckets) {
        if (visits >= bucket.min && visits <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    });

    const total = filteredFirstVisitData.length;
    return buckets.map(bucket => ({
      ...bucket,
      name: bucket.label,
      value: bucket.count,
      percentage: total > 0 ? ((bucket.count / total) * 100).toFixed(1) : 0
    }));
  }, [filteredFirstVisitData]);

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Client Retention</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  const total = filteredFirstVisitData.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '4px', color: data.color }}>
            {data.label}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>
            {data.count} clients ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: entry.color }} />
            <span style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Client Retention</h3>
      <p className="chart-subtitle">Distribution of clients by number of return visits</p>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            label={({ percentage }) => `${percentage}%`}
            labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-summary" style={{ textAlign: 'center', marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
        <span><strong>{chartData[0]?.count || 0}</strong> ({chartData[0]?.percentage}%) never returned</span>
        <span style={{ margin: '0 1rem' }}>|</span>
        <span><strong>{total - (chartData[0]?.count || 0)}</strong> ({(100 - parseFloat(chartData[0]?.percentage || 0)).toFixed(1)}%) came back at least once</span>
      </div>
    </div>
  );
};

export default RetentionFunnelChart;
