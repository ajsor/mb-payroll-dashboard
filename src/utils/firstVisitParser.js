import * as XLSX from 'xlsx';

/**
 * Normalize referral types into ~10-12 clean categories
 */
const normalizeReferralType = (referral) => {
  if (!referral || referral === 'Unassigned') {
    return 'Unassigned';
  }

  const lower = referral.toLowerCase();

  // ClassPass
  if (lower.includes('classpass') || lower.includes('class pass')) {
    return 'ClassPass';
  }

  // Word of Mouth (another client, friend, etc.)
  if (lower.includes('another client') || lower.includes('friend') || lower.includes('sister') || lower.includes('work...random')) {
    return 'Word of Mouth';
  }

  // Internet Search (Google, internet search)
  if (lower.includes('internet search') || lower.includes('google')) {
    return 'Internet Search';
  }

  // Social Media (Instagram, Facebook)
  if (lower.includes('instagram') || lower.includes('facebook') || lower.includes('social media')) {
    return 'Social Media';
  }

  // Events
  if (lower.includes('event') || lower.includes('bend fashion') || lower.includes('bend pride') || lower.includes('dustin riley') || lower.includes('dusty')) {
    return 'Event';
  }

  // Walk By
  if (lower.includes('walk by') || lower.includes('walk-by')) {
    return 'Walk By';
  }

  // Print Media (Newspaper, Magazine, Source Weekly, Bend Bulletin)
  if (lower.includes('newspaper') || lower.includes('magazine') || lower.includes('source weekly') || lower.includes('bend bulletin')) {
    return 'Print Media';
  }

  // Partner/Business (Tumalo Creek, Bend Vacations)
  if (lower.includes('tumalo') || lower.includes('bend vacations')) {
    return 'Partner';
  }

  // Instructor referral
  if (lower.includes('instructor')) {
    return 'Instructor';
  }

  // Reserve with Google (booking method but sometimes appears in referral)
  if (lower.includes('reserve with google')) {
    return 'Internet Search';
  }

  // Other - catch all
  if (lower.startsWith('other -') || lower === 'other') {
    // Already categorized above, this catches remaining "Other - X" entries
    return 'Other';
  }

  return 'Other';
};

/**
 * Convert Excel serial date to JavaScript Date
 */
const excelDateToJS = (serial) => {
  if (!serial || typeof serial !== 'number') return null;
  // Excel dates are days since Dec 30, 1899
  const utc_days = Math.floor(serial - 25569);
  return new Date(utc_days * 86400 * 1000);
};

/**
 * Format date as YYYY-MM-DD for consistency with payroll data
 */
const formatDateString = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse MindBody First Visit Report Excel file
 */
export const parseFirstVisitFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first sheet (should be "First Visit")
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse to JSON
        const rawData = XLSX.utils.sheet_to_json(sheet);

        // Transform and normalize data
        const firstVisitData = rawData.map((row, index) => {
          const firstVisitDate = excelDateToJS(row['First Visit']);

          return {
            id: index + 1,
            clientId: row['Client ID'] || '',
            clientName: row['Client'] || '',
            firstVisitDate: firstVisitDate,
            firstVisitDateStr: formatDateString(firstVisitDate),
            visitLocation: row['Visit Location'] || '',
            serviceCategory: row['Service Category'] || '',
            visitType: row['Visit Type'] || '',
            pricingOption: row['Pricing Option'] || '',
            bookingMethod: (row['Booking Method'] || '').trim(),
            referralType: row['Referral Type'] || '',
            referralTypeNormalized: normalizeReferralType(row['Referral Type']),
            staff: row['Staff'] || '',
            visitsSinceFirst: row['# Visits since First Visit'] || 0,
            phone: row['Phone'] || '',
            email: row['Email'] || ''
          };
        }).filter(row => row.clientId); // Filter out empty rows

        // Calculate date range
        const dates = firstVisitData
          .map(r => r.firstVisitDate)
          .filter(d => d instanceof Date && !isNaN(d.getTime()));

        const dateRange = dates.length > 0 ? {
          start: new Date(Math.min(...dates)),
          end: new Date(Math.max(...dates))
        } : null;

        // Get unique values for filters
        const serviceCategories = [...new Set(firstVisitData.map(r => r.serviceCategory))].filter(Boolean).sort();
        const staffList = [...new Set(firstVisitData.map(r => r.staff))].filter(Boolean).sort();
        const referralTypes = [...new Set(firstVisitData.map(r => r.referralTypeNormalized))].filter(Boolean).sort();

        resolve({
          firstVisitData,
          dateRange,
          serviceCategories,
          staffList,
          referralTypes,
          totalRecords: firstVisitData.length
        });

      } catch (error) {
        console.error('Error parsing First Visit file:', error);
        reject(new Error('Failed to parse First Visit Report. Please ensure the file format is correct.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Calculate metrics for First Visit data
 */
export const calculateFirstVisitMetrics = (data) => {
  if (!data || data.length === 0) {
    return {
      totalClients: 0,
      retentionRate1Plus: 0,
      retentionRate10Plus: 0
    };
  }

  const totalClients = data.length;
  const clientsWith1PlusVisits = data.filter(r => r.visitsSinceFirst >= 1).length;
  const clientsWith10PlusVisits = data.filter(r => r.visitsSinceFirst >= 10).length;

  return {
    totalClients,
    retentionRate1Plus: totalClients > 0 ? ((clientsWith1PlusVisits / totalClients) * 100).toFixed(1) : 0,
    retentionRate10Plus: totalClients > 0 ? ((clientsWith10PlusVisits / totalClients) * 100).toFixed(1) : 0
  };
};
