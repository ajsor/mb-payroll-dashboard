import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ZAxis
} from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const RetentionByInstructorChart = () => {
  const { filteredFirstVisitData } = usePayroll();

  const { chartData, maxClients } = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) {
      return { chartData: [], maxClients: 0 };
    }

    // Group by instructor (staff) and calculate retention metrics
    const instructorStats = {};

    filteredFirstVisitData.forEach(client => {
      const instructor = client.staff || 'Unknown';
      const visits = client.visitsSinceFirst || 0;

      if (!instructorStats[instructor]) {
        instructorStats[instructor] = {
          instructor,
          totalClients: 0,
          totalVisits: 0,
          retained: 0,
          highRetention: 0
        };
      }

      instructorStats[instructor].totalClients++;
      instructorStats[instructor].totalVisits += visits;
      if (visits >= 1) instructorStats[instructor].retained++;
      if (visits >= 10) instructorStats[instructor].highRetention++;
    });

    // Calculate averages and percentages
    const data = Object.values(instructorStats)
      .map(stat => ({
        ...stat,
        avgVisits: parseFloat((stat.totalVisits / stat.totalClients).toFixed(1)),
        retentionRate: ((stat.retained / stat.totalClients) * 100).toFixed(1),
        highRetentionRate: ((stat.highRetention / stat.totalClients) * 100).toFixed(1)
      }))
      .sort((a, b) => b.avgVisits - a.avgVisits);

    const max = Math.max(...data.map(d => d.totalClients));
    return { chartData: data, maxClients: max };
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
        <h3 className="chart-title">Retention by Instructor</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  const chartHeight = Math.max(350, chartData.length * 28 + 80);

  return (
    <div className="chart-container chart-scrollable">
      <h3 className="chart-title">Retention by Instructor</h3>
      <p className="chart-subtitle">Average return visits by instructor (dot size = client volume)</p>
      <div className="chart-scroll-area" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 50, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="instructor"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <ZAxis type="number" dataKey="totalClients" range={[30, 300]} />
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
                      <p style={{ fontWeight: 600, marginBottom: '8px' }}>{data.instructor}</p>
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
            <Bar dataKey="avgVisits" radius={[0, 4, 4, 0]} barSize={16}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.avgVisits)} />
              ))}
            </Bar>
            <Scatter
              dataKey="avgVisits"
              fill="#3b82f6"
              fillOpacity={0.7}
              stroke="#1d4ed8"
              strokeWidth={1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RetentionByInstructorChart;
