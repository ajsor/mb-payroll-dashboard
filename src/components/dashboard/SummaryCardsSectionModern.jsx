import React from 'react';
import { usePayroll } from '../../context/PayrollContext';
import { formatCurrency } from '../../utils/dataProcessor';

const SummaryCardsSectionModern = () => {
  const { metrics } = usePayroll();

  const summaryMetrics = [
    { value: metrics.totalInstructors, label: 'Total Instructors' },
    { value: metrics.totalClasses, label: 'Unique Classes' },
    { value: metrics.totalSessions?.toLocaleString() || '0', label: 'Total Sessions' },
    { value: formatCurrency(metrics.totalEarnings), label: 'Total Payroll' }
  ];

  return (
    <div className="flex flex-wrap justify-between gap-6 mb-8 rounded-xl border border-gray-200 bg-white px-8 py-6 dark:bg-slate-800 dark:border-slate-700">
      {summaryMetrics.map((metric, index) => (
        <div key={index} className="flex flex-col items-start">
          <span className="text-[2.25rem] font-bold leading-[1.2] text-gray-900 dark:text-slate-100">{metric.value}</span>
          <span className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">{metric.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SummaryCardsSectionModern;
