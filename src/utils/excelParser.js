import * as XLSX from 'xlsx';

/**
 * Extract instructor name from "Total for [Name]" text
 */
const extractInstructorFromTotal = (text) => {
  const match = String(text).match(/Total for\s+(.+)/i);
  return match ? match[1].trim() : null;
};

// Regex patterns to match date ranges (including various dash types)
const DATE_RANGE_PATTERNS = [
  /(\d{1,2}\/\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{1,2}\/\d{4})/,
  /(\d{1,2}-\d{1,2}-\d{4})\s*[-–—]\s*(\d{1,2}-\d{1,2}-\d{4})/,
  /(\d{4}\/\d{1,2}\/\d{1,2})\s*[-–—]\s*(\d{4}\/\d{1,2}\/\d{1,2})/,
  /(\w+,\s+\w+\s+\d{1,2},\s+\d{4})\s*[-–—]\s*(\w+,\s+\w+\s+\d{1,2},\s+\d{4})/,
  // More flexible pattern for full date strings
  /([A-Za-z]+,\s*[A-Za-z]+\s+\d+,\s+\d{4})\s*[-–—]\s*([A-Za-z]+,\s*[A-Za-z]+\s+\d+,\s+\d{4})/
];

/**
 * Extract date range from Excel sheet rows
 */
const extractDateRange = (rows) => {
  // Search top 10 rows for date range
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (!row) continue;

    // Check each cell in the row
    for (const cell of row) {
      if (!cell) continue;

      const cellStr = String(cell).trim();

      // Try each pattern
      for (const pattern of DATE_RANGE_PATTERNS) {
        const match = cellStr.match(pattern);
        if (match) {
          return {
            startDate: match[1],
            endDate: match[2],
            raw: cellStr
          };
        }
      }
    }
  }

  return null;
};

/**
 * Check if a row looks like an instructor name
 * (single cell with comma, like "LastName, FirstName")
 */
const isInstructorNameRow = (row) => {
  if (!row || row.length === 0) return false;

  // Count non-empty cells
  const nonEmptyCells = row.filter(cell => cell !== null && cell !== undefined && cell !== '');

  // Should be a single cell (or mostly empty with one main cell)
  if (nonEmptyCells.length !== 1) return false;

  const text = String(nonEmptyCells[0]).trim();

  // Should have a comma (name format), not be too long, and not contain certain keywords
  const isNameFormat = (
    text.includes(',') &&
    text.length < 100 &&
    text.length > 3 &&
    !text.toLowerCase().includes('pay rate') &&
    !text.includes('–') &&
    !text.includes('—') &&
    !text.toLowerCase().includes('class/') &&
    !text.toLowerCase().includes('date')
  );

  if (isNameFormat) {
    console.log(`  ✓ Identified as instructor name: "${text}"`);
  }

  return isNameFormat;
};

/**
 * Check if a row is a header row
 */
const isHeaderRow = (row) => {
  if (!row || row.length < 3) return false;

  const rowLower = row.map(cell =>
    cell ? String(cell).toLowerCase().trim() : ''
  );

  // Look for key header terms
  const hasClassDate = rowLower.some(cell => cell.includes('date'));
  const hasEarnings = rowLower.some(cell => cell.includes('earning') || cell.includes('pay'));
  const hasClassName = rowLower.some(cell => cell.includes('class') || cell.includes('name'));

  return hasClassDate && hasEarnings && hasClassName;
};

/**
 * Map column headers to standard field names
 */
const mapHeaders = (headers) => {
  const mapping = {};

  console.log('🗺️  Mapping headers:', headers);

  headers.forEach((header, index) => {
    if (!header) return;

    const headerLower = String(header).toLowerCase().trim();

    if (headerLower.includes('class') && headerLower.includes('name')) {
      mapping.className = index;
      console.log(`  Found className at column ${index}: "${header}"`);
    } else if (headerLower.includes('class') && headerLower.includes('date')) {
      mapping.classDate = index;
      console.log(`  Found classDate at column ${index}: "${header}"`);
    } else if (headerLower.includes('class') && headerLower.includes('time')) {
      mapping.classTime = index;
      console.log(`  Found classTime at column ${index}: "${header}"`);
    } else if ((headerLower.includes('staff') && headerLower.includes('paid') && !headerLower.includes('unpaid')) || headerLower === '# staff paid') {
      mapping.staffPaid = index;
      console.log(`  Found staffPaid at column ${index}: "${header}"`);
    } else if (headerLower.includes('earning')) {
      mapping.earnings = index;
      console.log(`  Found earnings at column ${index}: "${header}"`);
    } else if (headerLower.includes('base') && headerLower.includes('pay')) {
      mapping.basePay = index;
      console.log(`  Found basePay at column ${index}: "${header}"`);
    } else if (headerLower.includes('bonus') && headerLower.includes('pay')) {
      mapping.bonusPay = index;
      console.log(`  Found bonusPay at column ${index}: "${header}"`);
    }
  });

  console.log('📋 Final mapping:', mapping);
  return mapping;
};

/**
 * Convert Excel date number to readable date string
 */
const excelDateToString = (excelDate) => {
  if (typeof excelDate === 'string') return excelDate;
  if (!excelDate || isNaN(excelDate)) return '';

  // Excel stores dates as days since 1900-01-01
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toLocaleDateString();
};

/**
 * Parse a single data row into structured object
 */
const parseDataRow = (row, columnMapping, currentInstructorName) => {
  const obj = {
    instructorName: currentInstructorName
  };

  if (columnMapping.className !== undefined) {
    const classValue = row[columnMapping.className];
    obj.className = classValue ? String(classValue).trim() : '';
  }

  if (columnMapping.classDate !== undefined) {
    const dateValue = row[columnMapping.classDate];
    obj.classDate = excelDateToString(dateValue);
  }

  if (columnMapping.classTime !== undefined) {
    const timeValue = row[columnMapping.classTime];
    if (typeof timeValue === 'number' && timeValue < 1) {
      // Excel time fraction to hours:minutes
      const hours = Math.floor(timeValue * 24);
      const minutes = Math.round((timeValue * 24 - hours) * 60);
      obj.classTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      obj.classTime = timeValue ? String(timeValue).trim() : '';
    }
  }

  if (columnMapping.staffPaid !== undefined) {
    const staffValue = row[columnMapping.staffPaid];
    obj.staffPaid = staffValue ? Number(staffValue) : 0;
  }

  if (columnMapping.earnings !== undefined) {
    const earningsValue = row[columnMapping.earnings];

    if (earningsValue === null || earningsValue === undefined || earningsValue === '') {
      obj.earnings = 0;
    } else {
      // Remove currency symbols, commas, and parse
      const cleaned = String(earningsValue).replace(/[$,\s]/g, '');
      const parsed = parseFloat(cleaned);
      obj.earnings = isNaN(parsed) ? 0 : parsed;
    }
  }

  // Calculate earnings from base + bonus if earnings is 0
  if (obj.earnings === 0 && columnMapping.basePay !== undefined && columnMapping.bonusPay !== undefined) {
    const base = parseFloat(row[columnMapping.basePay]) || 0;
    const bonus = parseFloat(row[columnMapping.bonusPay]) || 0;
    obj.earnings = base + bonus;
  }

  return obj;
};

/**
 * Main function to parse Excel file
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        console.log(`📊 Excel file loaded: ${workbook.SheetNames.length} sheet(s)`);

        // Check if this is a multi-sheet workbook
        const isMultiSheet = workbook.SheetNames.length > 1;

        if (isMultiSheet) {
          console.log(`📚 Multi-sheet workbook detected. Processing all ${workbook.SheetNames.length} sheets...`);
        }

        // Get first sheet (or all sheets if multi-sheet)
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to array of arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log(`📊 First sheet has: ${rows.length} total rows`);

        if (!rows || rows.length === 0) {
          throw new Error('Excel file appears to be empty');
        }

        // Extract date range from first sheet
        let dateRange = extractDateRange(rows);

        // If not found in sheet, try to extract from filename
        if (!dateRange && file.name) {
          const filenameMatch = file.name.match(/(\d{1,2}-\d{1,2}-\d{4})\s*-\s*(\d{1,2}-\d{1,2}-\d{4})/);
          if (filenameMatch) {
            dateRange = {
              startDate: filenameMatch[1],
              endDate: filenameMatch[2],
              raw: `${filenameMatch[1]} - ${filenameMatch[2]}`
            };
            console.log('📅 Date range extracted from filename:', dateRange);
          }
        }

        if (dateRange) {
          console.log('📅 Date range found:', dateRange);
        } else {
          console.log('⚠️  No date range found in file or filename');
        }

        // Collect all payroll data
        const allPayrollData = [];

        // FIRST PASS: Find all "Total for [Name]" sheets to map instructor sections
        const instructorMap = new Map(); // Map of sheet index -> instructor name
        let currentInstructor = null;
        let sectionStartIndex = 0;

        console.log('\n🔍 First pass: Finding instructor sections...\n');

        for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
          const sheetName = workbook.SheetNames[sheetIndex];
          const sheet = workbook.Sheets[sheetName];
          const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Check if this sheet has a "Total for [Name]" row
          for (const row of sheetRows) {
            if (row && row[0] && String(row[0]).includes('Total for')) {
              const instructorName = extractInstructorFromTotal(row[0]);
              if (instructorName) {
                console.log(`  👤 Found instructor section: "${instructorName}" (sheets ${sectionStartIndex} to ${sheetIndex})`);

                // Apply this instructor name to all sheets from sectionStartIndex to current
                for (let i = sectionStartIndex; i <= sheetIndex; i++) {
                  instructorMap.set(i, instructorName);
                }

                currentInstructor = instructorName;
                sectionStartIndex = sheetIndex + 1;
                break;
              }
            }
          }
        }

        // Handle any remaining sheets at the end
        if (sectionStartIndex < workbook.SheetNames.length && currentInstructor) {
          for (let i = sectionStartIndex; i < workbook.SheetNames.length; i++) {
            instructorMap.set(i, currentInstructor);
          }
        }

        console.log(`\n📋 Mapped ${instructorMap.size} sheets to instructors\n`);

        // SECOND PASS: Process all sheets with assigned instructor names
        console.log('🔍 Second pass: Processing all sheets with data...\n');

        for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
          const sheetName = workbook.SheetNames[sheetIndex];
          const sheet = workbook.Sheets[sheetName];
          const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (sheetRows.length === 0) continue;

          // Get the instructor name for this sheet
          const instructorName = instructorMap.get(sheetIndex) || `Instructor ${sheetIndex + 1}`;

          // Parse this sheet
          const sheetData = parseSheet(sheetRows, sheetName, sheetIndex + 1, instructorName);

          if (sheetData.length > 0) {
            allPayrollData.push(...sheetData);
            console.log(`  ✓ Sheet ${sheetIndex + 1}: ${sheetData.length} rows for ${instructorName}`);
          }
        }

        console.log(`\n✅ Parsed ${allPayrollData.length} total data rows from ${workbook.SheetNames.length} sheet(s)`);

        if (allPayrollData.length === 0) {
          throw new Error('No valid data rows found in Excel file. Please check that your file has class data with dates and class names.');
        }

        resolve({
          dateRange,
          payrollData: allPayrollData,
          rowCount: allPayrollData.length
        });

      } catch (error) {
        console.error('❌ Error parsing Excel:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse a single sheet and return its data rows
 */
const parseSheet = (rows, sheetName, sheetNumber, instructorName) => {
  const payrollData = [];
  let currentInstructorName = instructorName;
  let currentColumnMapping = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Skip empty rows
    if (!row || row.length === 0 || !row.some(cell => cell)) {
      continue;
    }

    // Skip "Total for" rows (summary rows)
    if (row[0] && String(row[0]).includes('Total for')) {
      continue;
    }

    // Check if this is an instructor name row (single cell with comma, like "LastName, FirstName")
    if (isInstructorNameRow(row)) {
      currentInstructorName = String(row[0]).trim();
      continue;
    }

    // Check if this is a header row
    if (isHeaderRow(row)) {
      currentColumnMapping = mapHeaders(row);

      // If we found an instructor name in rows above, use it
      if (!currentInstructorName) {
        for (let j = Math.max(0, i - 5); j < i; j++) {
          if (isInstructorNameRow(rows[j])) {
            currentInstructorName = String(rows[j][0]).trim();
            break;
          }
        }
      }

      continue;
    }

    // If we have column mapping and instructor name, parse data rows
    if (currentColumnMapping && currentInstructorName) {
      const dataObj = parseDataRow(row, currentColumnMapping, currentInstructorName);

      // Only add rows with valid data
      if (dataObj.className || dataObj.classDate) {
        payrollData.push(dataObj);
      }
    }
  }

  return payrollData;
};
