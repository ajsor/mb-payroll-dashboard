import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { usePayroll } from '../../context/PayrollContext';

// Decode HTML entities
const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const UnderperformingClassesChart = () => {
  const { filteredPayrollData } = usePayroll();
  const [viewType, setViewType] = useState('belowAvg'); // 'belowAvg' or 'declining'
  const [sortConfig, setSortConfig] = useState({ key: 'avgAttendance', direction: 'asc' });

  const { belowAvgClasses, decliningClasses, overallAvg } = useMemo(() => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      return { belowAvgClasses: [], decliningClasses: [], overallAvg: 0 };
    }

    const classStats = {};
    const monthlyClassData = {};
    let totalAttendance = 0;
    let totalSessions = 0;

    filteredPayrollData.forEach(row => {
      if (!row.className) return;

      const attendance = row.staffPaid || 0;
      totalAttendance += attendance;
      totalSessions++;

      // Overall stats
      if (!classStats[row.className]) {
        classStats[row.className] = {
          name: decodeHtmlEntities(row.className),
          rawName: row.className,
          totalAttendance: 0,
          sessions: 0
        };
      }
      classStats[row.className].totalAttendance += attendance;
      classStats[row.className].sessions++;

      // Monthly stats for trend analysis
      if (row.classDate) {
        const date = new Date(row.classDate);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyClassData[row.className]) {
            monthlyClassData[row.className] = {};
          }
          if (!monthlyClassData[row.className][monthKey]) {
            monthlyClassData[row.className][monthKey] = { total: 0, count: 0 };
          }
          monthlyClassData[row.className][monthKey].total += attendance;
          monthlyClassData[row.className][monthKey].count++;
        }
      }
    });

    const overallAvg = totalSessions > 0 ? totalAttendance / totalSessions : 0;

    // Calculate averages and find below-average classes
    const belowAvgClasses = Object.values(classStats)
      .filter(stat => stat.sessions >= 3) // Minimum sessions
      .map(stat => ({
        ...stat,
        avgAttendance: Math.round((stat.totalAttendance / stat.sessions) * 10) / 10,
        percentOfAvg: Math.round((stat.totalAttendance / stat.sessions / overallAvg) * 100)
      }))
      .filter(stat => stat.avgAttendance < overallAvg)
      .sort((a, b) => a.avgAttendance - b.avgAttendance)
      .slice(0, 15);

    // Calculate declining classes (comparing first half to second half)
    const decliningClasses = [];

    Object.entries(monthlyClassData).forEach(([className, months]) => {
      const sortedMonths = Object.keys(months).sort();
      if (sortedMonths.length < 2) return;

      const midpoint = Math.floor(sortedMonths.length / 2);
      const firstHalf = sortedMonths.slice(0, midpoint);
      const secondHalf = sortedMonths.slice(midpoint);

      const firstAvg = firstHalf.reduce((sum, m) => {
        return sum + (months[m].total / months[m].count);
      }, 0) / firstHalf.length;

      const secondAvg = secondHalf.reduce((sum, m) => {
        return sum + (months[m].total / months[m].count);
      }, 0) / secondHalf.length;

      const changePercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
      const totalSessions = Object.values(months).reduce((sum, m) => sum + m.count, 0);

      if (changePercent < -5 && totalSessions >= 5) { // At least 5% decline
        decliningClasses.push({
          name: decodeHtmlEntities(className),
          rawName: className,
          firstAvg: Math.round(firstAvg * 10) / 10,
          secondAvg: Math.round(secondAvg * 10) / 10,
          changePercent: Math.round(changePercent * 10) / 10,
          sessions: totalSessions
        });
      }
    });

    decliningClasses.sort((a, b) => a.changePercent - b.changePercent);

    return {
      belowAvgClasses,
      decliningClasses: decliningClasses.slice(0, 15),
      overallAvg: Math.round(overallAvg * 10) / 10
    };
  }, [filteredPayrollData]);

  // Sort handler for table
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Sorted data
  const sortedBelowAvg = useMemo(() => {
    return [...belowAvgClasses].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [belowAvgClasses, sortConfig]);

  const sortedDeclining = useMemo(() => {
    return [...decliningClasses].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? a.changePercent;
      const bVal = b[sortConfig.key] ?? b.changePercent;
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [decliningClasses, sortConfig]);

  const currentData = viewType === 'belowAvg' ? belowAvgClasses : decliningClasses;

  if (currentData.length === 0 && belowAvgClasses.length === 0 && decliningClasses.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Underperforming Classes</h3>
        <div className="chart-empty">No underperforming classes found</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Underperforming Classes</h3>
      <div className="chart-controls">
        <label>View: </label>
        <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
          <option value="belowAvg">Below Average Attendance ({belowAvgClasses.length})</option>
          <option value="declining">Declining Attendance ({decliningClasses.length})</option>
        </select>
      </div>

      {viewType === 'belowAvg' ? (
        <>
          <p className="chart-subtitle">
            Classes with attendance below the overall average of {overallAvg}
          </p>

          {belowAvgClasses.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={belowAvgClasses.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax + 2']} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                  />
                  <ReferenceLine x={overallAvg} stroke="#2e7d32" strokeDasharray="5 5" label={{ value: 'Avg', position: 'top', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{data.name}</p>
                            <p style={{ margin: '0 0 2px', color: '#d32f2f' }}>
                              Avg Attendance: {data.avgAttendance}
                            </p>
                            <p style={{ margin: '0 0 2px', color: '#666' }}>
                              {data.percentOfAvg}% of overall average
                            </p>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                              {data.sessions} sessions
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgAttendance">
                    {belowAvgClasses.slice(0, 10).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.percentOfAvg < 50 ? '#d32f2f' : entry.percentOfAvg < 75 ? '#f57c00' : '#ffc107'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="underperforming-table">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} className="sortable-header">
                        Class Name{getSortIndicator('name')}
                      </th>
                      <th onClick={() => handleSort('avgAttendance')} className="sortable-header">
                        Avg Attendance{getSortIndicator('avgAttendance')}
                      </th>
                      <th onClick={() => handleSort('percentOfAvg')} className="sortable-header">
                        % of Avg{getSortIndicator('percentOfAvg')}
                      </th>
                      <th onClick={() => handleSort('sessions')} className="sortable-header">
                        Sessions{getSortIndicator('sessions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBelowAvg.map((cls, idx) => (
                      <tr key={idx}>
                        <td>{cls.name}</td>
                        <td style={{ color: '#d32f2f', fontWeight: 600 }}>{cls.avgAttendance}</td>
                        <td>{cls.percentOfAvg}%</td>
                        <td>{cls.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="chart-empty">No classes below average attendance</div>
          )}
        </>
      ) : (
        <>
          <p className="chart-subtitle">
            Classes showing decline comparing first half to second half of period
          </p>

          {decliningClasses.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={decliningClasses.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={['dataMin - 5', 5]} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => value.length > 18 ? value.substring(0, 18) + '...' : value}
                  />
                  <ReferenceLine x={0} stroke="#666" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{data.name}</p>
                            <p style={{ margin: '0 0 2px', color: '#d32f2f' }}>
                              Change: {data.changePercent}%
                            </p>
                            <p style={{ margin: '0 0 2px', color: '#666' }}>
                              First Half Avg: {data.firstAvg}
                            </p>
                            <p style={{ margin: '0 0 2px', color: '#666' }}>
                              Second Half Avg: {data.secondAvg}
                            </p>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                              {data.sessions} total sessions
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="changePercent">
                    {decliningClasses.slice(0, 10).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.changePercent < -20 ? '#d32f2f' : entry.changePercent < -10 ? '#f57c00' : '#ffc107'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="underperforming-table">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} className="sortable-header">
                        Class Name{getSortIndicator('name')}
                      </th>
                      <th onClick={() => handleSort('changePercent')} className="sortable-header">
                        Change{getSortIndicator('changePercent')}
                      </th>
                      <th onClick={() => handleSort('firstAvg')} className="sortable-header">
                        First Half{getSortIndicator('firstAvg')}
                      </th>
                      <th onClick={() => handleSort('secondAvg')} className="sortable-header">
                        Second Half{getSortIndicator('secondAvg')}
                      </th>
                      <th onClick={() => handleSort('sessions')} className="sortable-header">
                        Sessions{getSortIndicator('sessions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDeclining.map((cls, idx) => (
                      <tr key={idx}>
                        <td>{cls.name}</td>
                        <td style={{ color: '#d32f2f', fontWeight: 600 }}>{cls.changePercent}%</td>
                        <td>{cls.firstAvg}</td>
                        <td>{cls.secondAvg}</td>
                        <td>{cls.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="chart-empty">No significantly declining classes found</div>
          )}
        </>
      )}
    </div>
  );
};

export default UnderperformingClassesChart;
