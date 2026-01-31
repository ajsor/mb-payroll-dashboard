import React from 'react';
import * as XLSX from 'xlsx';
// Hidden export triggers for toolbar
import { usePayroll } from '../../context/PayrollContext';
import { formatCurrency } from '../../utils/dataProcessor';

const ExportButtonHidden = () => {
  const { filteredPayrollData, metrics, dateFilter } = usePayroll();

  const getDateRangeString = () => {
    const start = dateFilter.startDate || 'All';
    const end = dateFilter.endDate || 'All';
    return `${start} to ${end}`;
  };

  const exportToExcel = () => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      alert('No data to export');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Payroll Dashboard Export'],
      [''],
      ['Date Range', getDateRangeString()],
      [''],
      ['Summary Metrics'],
      ['Total Instructors', metrics.totalInstructors],
      ['Total Classes', metrics.totalClasses],
      ['Total Sessions', metrics.totalSessions],
      ['Total Payroll', formatCurrency(metrics.totalEarnings)],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Detailed data sheet
    const detailData = filteredPayrollData.map(row => ({
      'Instructor': row.instructorName || '',
      'Class Name': row.className || '',
      'Class Date': row.classDate || '',
      'Class Time': row.classTime || '',
      'Attendance': row.staffPaid || 0,
      'Earnings': row.earnings || 0
    }));
    const detailSheet = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, detailSheet, 'Detail Data');

    // Instructor summary sheet
    const instructorStats = {};
    filteredPayrollData.forEach(row => {
      if (!row.instructorName) return;
      if (!instructorStats[row.instructorName]) {
        instructorStats[row.instructorName] = {
          sessions: 0,
          totalAttendance: 0,
          totalEarnings: 0
        };
      }
      instructorStats[row.instructorName].sessions++;
      instructorStats[row.instructorName].totalAttendance += row.staffPaid || 0;
      instructorStats[row.instructorName].totalEarnings += row.earnings || 0;
    });

    const instructorData = Object.entries(instructorStats)
      .map(([name, stats]) => ({
        'Instructor': name,
        'Sessions': stats.sessions,
        'Total Attendance': stats.totalAttendance,
        'Avg Attendance': (stats.totalAttendance / stats.sessions).toFixed(1),
        'Total Earnings': stats.totalEarnings
      }))
      .sort((a, b) => b['Total Earnings'] - a['Total Earnings']);
    const instructorSheet = XLSX.utils.json_to_sheet(instructorData);
    XLSX.utils.book_append_sheet(wb, instructorSheet, 'By Instructor');

    // Class summary sheet
    const classStats = {};
    filteredPayrollData.forEach(row => {
      if (!row.className) return;
      if (!classStats[row.className]) {
        classStats[row.className] = {
          sessions: 0,
          totalAttendance: 0
        };
      }
      classStats[row.className].sessions++;
      classStats[row.className].totalAttendance += row.staffPaid || 0;
    });

    const classData = Object.entries(classStats)
      .map(([name, stats]) => ({
        'Class Name': name,
        'Sessions': stats.sessions,
        'Total Attendance': stats.totalAttendance,
        'Avg Attendance': (stats.totalAttendance / stats.sessions).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b['Avg Attendance']) - parseFloat(a['Avg Attendance']));
    const classSheet = XLSX.utils.json_to_sheet(classData);
    XLSX.utils.book_append_sheet(wb, classSheet, 'By Class');

    // Generate filename with date range
    const filename = `Payroll_Report_${dateFilter.startDate || 'All'}_to_${dateFilter.endDate || 'All'}.xlsx`.replace(/\//g, '-');
    XLSX.writeFile(wb, filename);
  };

  const exportToCSV = () => {
    if (!filteredPayrollData || filteredPayrollData.length === 0) {
      alert('No data to export');
      return;
    }

    const detailData = filteredPayrollData.map(row => ({
      'Instructor': row.instructorName || '',
      'Class Name': row.className || '',
      'Class Date': row.classDate || '',
      'Class Time': row.classTime || '',
      'Attendance': row.staffPaid || 0,
      'Earnings': row.earnings || 0
    }));

    const ws = XLSX.utils.json_to_sheet(detailData);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Payroll_Data_${dateFilter.startDate || 'All'}_to_${dateFilter.endDate || 'All'}.csv`.replace(/\//g, '-');
    link.click();
  };

  return (
    <div style={{ display: 'none' }}>
      <button className="export-excel-trigger" onClick={exportToExcel}>Excel</button>
      <button className="export-csv-trigger" onClick={exportToCSV}>CSV</button>
    </div>
  );
};

export default ExportButtonHidden;
