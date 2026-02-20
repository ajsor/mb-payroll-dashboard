import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

const MIN_CLIENTS = 5;

const RetentionByClassNameChart = () => {
  const { filteredFirstVisitData } = usePayroll();

  const { chartData, totalClasses } = useMemo(() => {
    if (!filteredFirstVisitData || filteredFirstVisitData.length === 0) {
      return { chartData: [], totalClasses: 0 };
    }

    // Group by individual class name (visitType) and calculate retention metrics
    const classStats = {};

    filteredFirstVisitData.forEach(client => {
      const className = client.visitType || 'Unknown';
      const visits = client.visitsSinceFirst || 0;

      if (!classStats[className]) {
        classStats[className] = {
          className,
          shortName: className.length > 25 ? className.substring(0, 22) + '...' : className,
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

    const allClasses = Object.values(classStats);

    // Calculate averages and percentages, filter to minimum clients
    const filtered = allClasses
      .map(stat => ({
        ...stat,
        avgVisits: parseFloat((stat.totalVisits / stat.totalClients).toFixed(1)),
        retentionRate: ((stat.retained / stat.totalClients) * 100).toFixed(1),
        highRetentionRate: ((stat.highRetention / stat.totalClients) * 100).toFixed(1),
        label: `(${stat.totalClients})`
      }))
      .filter(stat => stat.totalClients >= MIN_CLIENTS)
      .sort((a, b) => b.avgVisits - a.avgVisits);

    return { chartData: filtered, totalClasses: allClasses.length };
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
        <h3 className="chart-title">Retention by Class</h3>
        <div className="chart-empty">No classes with {MIN_CLIENTS}+ first-time clients</div>
      </div>
    );
  }

  const chartHeight = Math.max(350, chartData.length * 28 + 80);
  const excludedCount = totalClasses - chartData.length;

  return (
    <div className="chart-container chart-scrollable">
      <h3 className="chart-title">Retention by Class</h3>
      <p className="chart-subtitle">
        Average return visits by class ({MIN_CLIENTS}+ clients) — showing {chartData.length} of {totalClasses} classes
      </p>
      <div className="chart-scroll-area" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 60, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fontSize: 10 }}
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      maxWidth: '280px'
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
              <LabelList
                dataKey="label"
                position="right"
                style={{ fontSize: '10px', fill: '#6b7280' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RetentionByClassNameChart;
