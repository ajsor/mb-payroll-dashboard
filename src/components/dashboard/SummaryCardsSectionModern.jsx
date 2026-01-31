import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatCurrency } from '../../utils/dataProcessor';

const SummaryCardsSectionModern = () => {
  const { metrics } = usePayroll();

  const summaryMetrics = [
    {
      value: metrics.totalInstructors,
      label: 'Total Instructors'
    },
    {
      value: metrics.totalClasses,
      label: 'Unique Classes'
    },
    {
      value: metrics.totalSessions?.toLocaleString() || '0',
      label: 'Total Sessions'
    },
    {
      value: formatCurrency(metrics.totalEarnings),
      label: 'Total Payroll'
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

export default SummaryCardsSectionModern;
