import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';
import {
  chartContainer,
  chartTitle,
  chartSubtitle,
  chartEmpty,
  scrollableChartWrapper
} from '../../styles/chartClasses';

// Decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const InstructorWorkloadChart = () => {
  const { filteredPayrollData } = usePayroll();

  // Calculate sessions per instructor
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    const instructorStats = {};

    filteredPayrollData.forEach(row => {
      if (!row.instructorName) return;

      if (!instructorStats[row.instructorName]) {
        instructorStats[row.instructorName] = 0;
      }
      instructorStats[row.instructorName]++;
    });

    // Sort by session count descending - show all instructors
    const result = Object.entries(instructorStats)
      .map(([name, sessions]) => ({ name: decodeHtmlEntities(name), sessions }))
      .sort((a, b) => b.sessions - a.sessions);

    return result;
  }, [filteredPayrollData]);

  if (chartData.length === 0) {
    return (
      <div className={chartContainer}>
        <h3 className={chartTitle}>Instructor Workload</h3>
        <div className={chartEmpty}>No data available</div>
      </div>
    );
  }

  // Calculate dynamic height based on number of items (35px per bar)
  const chartHeight = Math.max(400, chartData.length * 35);

  return (
    <div className={chartContainer}>
      <h3 className={chartTitle}>Instructor Workload</h3>
      <p className={chartSubtitle}>All {chartData.length} instructors by number of sessions (scroll to see more)</p>
      <div className={scrollableChartWrapper}>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Sessions', position: 'bottom', offset: 0 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={90}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [value, 'Sessions']}
              />
              <Bar dataKey="sessions" fill="#0288d1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InstructorWorkloadChart;
