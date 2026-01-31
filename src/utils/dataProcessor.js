/**
 * Calculate summary metrics from payroll data
 */
export const calculateMetrics = (payrollData) => {
  if (!payrollData || payrollData.length === 0) {
    return {
      totalInstructors: 0,
      totalClasses: 0,
      totalSessions: 0,
      totalEarnings: 0
    };
  }

  // Count unique instructors
  const uniqueInstructors = new Set(
    payrollData.map(row => row.instructorName).filter(Boolean)
  );

  // Count unique classes (class types)
  const uniqueClasses = new Set(
    payrollData.map(row => row.className).filter(Boolean)
  );

  // Count total sessions (total rows with class data)
  const totalSessions = payrollData.filter(row => row.className || row.classDate).length;

  // Sum total earnings
  const totalEarnings = payrollData.reduce((sum, row) => {
    return sum + (row.earnings || 0);
  }, 0);

  return {
    totalInstructors: uniqueInstructors.size,
    totalClasses: uniqueClasses.size,
    totalSessions: totalSessions,
    totalEarnings: totalEarnings
  };
};

/**
 * Prepare data for earnings by instructor chart
 */
export const prepareEarningsByInstructor = (payrollData) => {
  if (!payrollData || payrollData.length === 0) return [];
  
  // Aggregate earnings by instructor
  const instructorMap = new Map();
  
  payrollData.forEach(row => {
    const name = row.instructorName;
    if (!name) return;
    
    const current = instructorMap.get(name) || 0;
    instructorMap.set(name, current + (row.earnings || 0));
  });
  
  // Convert to array and sort by earnings (descending)
  const chartData = Array.from(instructorMap.entries())
    .map(([name, earnings]) => ({
      name,
      earnings: Math.round(earnings * 100) / 100 // Round to 2 decimals
    }))
    .sort((a, b) => b.earnings - a.earnings);
  
  return chartData;
};

/**
 * Prepare data for class distribution chart
 */
export const prepareClassDistribution = (payrollData) => {
  if (!payrollData || payrollData.length === 0) return [];
  
  // Count sessions per class
  const classMap = new Map();
  
  payrollData.forEach(row => {
    const className = row.className;
    if (!className) return;
    
    const current = classMap.get(className) || 0;
    classMap.set(className, current + 1);
  });
  
  // Convert to array and sort by count
  const chartData = Array.from(classMap.entries())
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value);
  
  return chartData;
};

/**
 * Prepare data for earnings over time chart
 */
export const prepareEarningsOverTime = (payrollData) => {
  if (!payrollData || payrollData.length === 0) return [];
  
  // Aggregate earnings by date
  const dateMap = new Map();
  
  payrollData.forEach(row => {
    const date = row.classDate;
    if (!date) return;
    
    // Normalize date format
    const dateStr = String(date).trim();
    
    const current = dateMap.get(dateStr) || 0;
    dateMap.set(dateStr, current + (row.earnings || 0));
  });
  
  // Convert to array and sort by date
  const chartData = Array.from(dateMap.entries())
    .map(([date, earnings]) => ({
      date,
      earnings: Math.round(earnings * 100) / 100
    }))
    .sort((a, b) => {
      // Try to parse dates for proper sorting
      try {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      } catch {
        return a.date.localeCompare(b.date);
      }
    });
  
  return chartData;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
