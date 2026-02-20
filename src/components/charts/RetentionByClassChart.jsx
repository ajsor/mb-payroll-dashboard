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

const RetentionByClassChart = () => {
  const { filteredFirstVisitData } = usePayroll();

  const chartData = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) return [];

    // Group by service category and calculate retention metrics
    const classStats = {};

    filteredFirstVisitData.forEach(client => {
      const className = client.serviceCategory || 'Unknown';
      const visits = client.visitsSinceFirst || 0;

      if (!classStats[className]) {
        classStats[className] = {
          className,
          shortName: className.replace(' Classes', '').replace(' AM', ' (AM)'),
          totalClients: 0,
          totalVisits: 0,
          retained: 0,
          highRetention: 0
        };
      }

      classStats[className].totalClients++;
      classStats[className].totalVisits += visits;
      if (visits >= 1) classStats[className].retained++;
      if (visits >= 10) classStats[className].highRetention++;
    });

    // Calculate averages and percentages
    return Object.values(classStats)
      .map(stat => ({
        ...stat,
        avgVisits: parseFloat((stat.totalVisits / stat.totalClients).toFixed(1)),
        retentionRate: ((stat.retained / stat.totalClients) * 100).toFixed(1),
        highRetentionRate: ((stat.highRetention / stat.totalClients) * 100).toFixed(1)
      }))
      .filter(stat => stat.totalClients >= 5) // Lower threshold since fewer categories
      .sort((a, b) => b.avgVisits - a.avgVisits);
  }, [filteredFirstVisitData]);

  const getBarColor = (avgVisits) => {
    if (avgVisits >= 30) return '#10b981';
    if (avgVisits >= 20) return '#22c55e';
    if (avgVisits >= 10) return '#84cc16';
    if (avgVisits >= 5) return '#eab308';
    return '#f97316';
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Retention by Class Type</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  const chartHeight = Math.max(350, chartData.length * 35 + 80);

  return (
    <div className="chart-container">
      <h3 className="chart-title">Retention by Class Type</h3>
      <p className="chart-subtitle">Average return visits by first class service category</p>
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
            dataKey="shortName"
            tick={{ fontSize: 11 }}
            width={130}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>{data.className}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0' }}>
                      First-time Clients: <strong>{data.totalClients}</strong>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0' }}>
                      Avg Return Visits: <strong>{data.avgVisits}</strong>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0' }}>
                      Retention (1+): <strong>{data.retentionRate}%</strong>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0' }}>
                      High Retention (10+): <strong>{data.highRetentionRate}%</strong>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="avgVisits" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.avgVisits)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetentionByClassChart;
