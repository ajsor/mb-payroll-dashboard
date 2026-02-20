import React from 'react';
import { usePayroll } from '../../context/PayrollContext';

const ClientSummaryCards = () => {
  const { firstVisitMetrics } = usePayroll();

  const summaryMetrics = [
    {
      value: firstVisitMetrics.totalClients?.toLocaleString() || '0',
      label: 'New Clients'
    },
    {
      value: `${firstVisitMetrics.retentionRate1Plus}%`,
      label: 'Retention Rate (1+ visits)'
    },
    {
      value: `${firstVisitMetrics.retentionRate10Plus}%`,
      label: 'Retention Rate (10+ visits)'
    }
  ];

  return (
    <div className="summary-metrics-card">
      {summaryMetrics.map((metric, index) => (
        <div key={index} className="summary-metric">
          <span className="metric-value">{metric.value}</span>
          <span className="metric-label">{metric.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ClientSummaryCards;
