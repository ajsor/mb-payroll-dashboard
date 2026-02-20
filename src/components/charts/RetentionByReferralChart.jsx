import React, { useMemo, useState } from 'react';
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

const RetentionByReferralChart = () => {
  const { filteredFirstVisitData } = usePayroll();
  const [selectedSource, setSelectedSource] = useState(null);

  const chartData = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) return [];

    // Group by referral source and calculate retention metrics
    const sourceStats = {};

    filteredFirstVisitData.forEach(client => {
      const source = client.referralTypeNormalized || 'Unknown';
      const visits = client.visitsSinceFirst || 0;

      if (!sourceStats[source]) {
        sourceStats[source] = {
          source,
          totalClients: 0,
          totalVisits: 0,
          retained: 0,  // 1+ visits
          highRetention: 0  // 10+ visits
        };
      }

      sourceStats[source].totalClients++;
      sourceStats[source].totalVisits += visits;
      if (visits >= 1) sourceStats[source].retained++;
      if (visits >= 10) sourceStats[source].highRetention++;
    });

    // Calculate averages and percentages
    return Object.values(sourceStats)
      .map(stat => ({
        ...stat,
        avgVisits: (stat.totalVisits / stat.totalClients).toFixed(1),
        retentionRate: ((stat.retained / stat.totalClients) * 100).toFixed(1),
        highRetentionRate: ((stat.highRetention / stat.totalClients) * 100).toFixed(1)
      }))
      .filter(stat => stat.totalClients >= 10) // Only show sources with 10+ clients
      .sort((a, b) => parseFloat(b.avgVisits) - parseFloat(a.avgVisits));
  }, [filteredFirstVisitData]);

  // Get color based on retention quality
  const getBarColor = (avgVisits) => {
    const visits = parseFloat(avgVisits);
    if (visits >= 30) return '#10b981';
    if (visits >= 20) return '#22c55e';
    if (visits >= 10) return '#84cc16';
    if (visits >= 5) return '#eab308';
    return '#f97316';
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Retention by Referral Source</h3>
        <div className="chart-empty">No data available</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Retention by Referral Source</h3>
      <p className="chart-subtitle">Average return visits by how clients found you (min 10 clients)</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} label={{ value: 'Avg Visits', position: 'bottom', offset: 0 }} />
          <YAxis
            type="category"
            dataKey="source"
            tick={{ fontSize: 12 }}
            width={110}
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
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>{data.source}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Total Clients: <strong>{data.totalClients}</strong>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Avg Visits: <strong>{data.avgVisits}</strong>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Retention (1+): <strong>{data.retentionRate}%</strong>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      High Retention (10+): <strong>{data.highRetentionRate}%</strong>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="avgVisits"
            radius={[0, 4, 4, 0]}
            onClick={(data) => setSelectedSource(data.source)}
            style={{ cursor: 'pointer' }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.avgVisits)}
                opacity={selectedSource === null || selectedSource === entry.source ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {selectedSource && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={() => setSelectedSource(null)}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '0.25rem 0.75rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
};

export default RetentionByReferralChart;
