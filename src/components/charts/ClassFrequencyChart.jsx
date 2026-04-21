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

const ClassFrequencyChart = () => {
  const { filteredPayrollData } = usePayroll();

  // Calculate frequency per class
  const chartData = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) return [];

    const classStats = {};

    filteredPayrollData.forEach(row => {
      if (!row.className) return;

      if (!classStats[row.className]) {
        classStats[row.className] = 0;
      }
      classStats[row.className]++;
    });

    // Sort by frequency descending - show all classes
    const result = Object.entries(classStats)
      .map(([name, frequency]) => ({
        name: decodeHtmlEntities(name),
        fullName: name,
        frequency
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return result;
  }, [filteredPayrollData]);

  if (chartData.length === 0) {
    return (
      <div className={chartContainer}>
        <h3 className={chartTitle}>Class Frequency</h3>
        <div className={chartEmpty}>No data available</div>
      </div>
    );
  }

  // Calculate dynamic height based on number of items (35px per bar)
  const chartHeight = Math.max(400, chartData.length * 35);

  return (
    <div className={chartContainer}>
      <h3 className={chartTitle}>Class Frequency</h3>
      <p className={chartSubtitle}>All {chartData.length} classes by number of sessions (scroll to see more)</p>
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
                width={110}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
              />
              <Tooltip
                formatter={(value) => [value, 'Sessions']}
                labelFormatter={(label) => decodeHtmlEntities(label)}
              />
              <Bar dataKey="frequency" fill="#7b1fa2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ClassFrequencyChart;
