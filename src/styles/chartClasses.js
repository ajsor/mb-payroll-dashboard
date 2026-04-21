// Shared Tailwind class strings used across chart components.
// Replaces the old `.chart-*` and `.instructor-detail-table` rules from Dashboard.css.

export const chartContainer =
  'rounded-xl border border-gray-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:bg-slate-800 dark:border-slate-700';

export const chartTitle =
  'mb-4 text-center text-[1.3rem] text-gray-800 dark:text-slate-100';

export const chartSubtitle =
  'text-center text-[0.9rem] text-gray-500 -mt-2 mb-4 dark:text-slate-400';

export const chartEmpty =
  'text-center text-gray-400 py-16 px-8 text-[1.1rem]';

export const chartHeaderRow =
  'flex items-start justify-between mb-2';

export const chartToggleBtn =
  'whitespace-nowrap rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-[0.8125rem] text-gray-700 cursor-pointer transition-all hover:bg-gray-200 hover:border-gray-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 dark:hover:border-slate-500';

export const chartScrollArea =
  'flex-1 overflow-y-auto rounded-lg [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500';

export const chartScrollable = 'flex flex-col';

export const scrollableChartWrapper =
  'max-h-[400px] overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-indigo-400 [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500 dark:border-slate-600 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-500';

// Drill-down detail tables (TopEarners, TopAttendance, InstructorConsistency, PopularClasses, AttendanceHeatmap)
export const detailTable =
  'mt-8 rounded-lg border-2 border-indigo-400 bg-white p-6 dark:bg-slate-900 dark:border-indigo-500';

export const detailTableHeading =
  'mb-2 flex items-center justify-between text-[1.1rem] text-gray-800 dark:text-slate-100';

export const closeDetailBtn =
  'rounded-md border-2 border-gray-300 bg-gray-100 px-4 py-1.5 text-[0.85rem] font-semibold text-gray-500 cursor-pointer transition-all hover:bg-red-400 hover:text-white hover:border-red-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300';

export const detailSummary =
  'mb-4 text-[0.9rem] text-gray-500 dark:text-slate-400';

export const tableWrapper =
  'max-h-[300px] overflow-y-auto';

export const detailTableEl =
  'w-full border-collapse';

export const detailTh =
  'sticky top-0 bg-indigo-400 px-3 py-3 text-left font-semibold text-white border-b border-gray-200';

export const detailTd =
  'px-3 py-3 text-left border-b border-gray-200 text-gray-700 dark:text-slate-300 dark:border-slate-700';

export const detailTdLast =
  'px-3 py-3 text-center border-b border-gray-200 font-semibold text-gray-700 dark:text-slate-300 dark:border-slate-700';

export const detailRowHover =
  'hover:bg-gray-100 dark:hover:bg-slate-800';

export const sortableHeader =
  'cursor-pointer select-none transition-colors hover:bg-indigo-500';

// chart-controls select dropdown
export const chartControls =
  'flex items-center justify-center gap-2 mb-4';

export const chartControlsLabel =
  'font-semibold text-gray-800 dark:text-slate-200';

export const chartControlsSelect =
  'cursor-pointer rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-[0.95rem] transition-colors focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200';

// underperforming-table (smaller font/padding than detail table)
export const underperformingTable =
  'mt-4 max-h-[200px] overflow-y-auto';

export const underperformingTableEl =
  'w-full border-collapse text-[0.85rem]';

export const underperformingTh =
  'sticky top-0 bg-indigo-400 px-3 py-2 text-left font-semibold text-white border-b border-gray-200';

export const underperformingTd =
  'px-3 py-2 text-left border-b border-gray-200 text-gray-700 dark:text-slate-300 dark:border-slate-700';

// Heatmap
export const heatmapWrapper =
  'overflow-x-auto my-4';

export const heatmapTable =
  'w-full border-collapse text-[0.85rem]';

export const heatmapHeaderCell =
  'bg-indigo-400 text-white font-semibold p-2 text-center min-w-[50px]';

export const heatmapTimeCell =
  'bg-gray-100 font-semibold px-2 py-1.5 text-right whitespace-nowrap text-[0.8rem] dark:bg-slate-700 dark:text-slate-200';

export const heatmapCell =
  'p-1.5 text-center text-[0.8rem] font-medium border border-white min-w-[45px] transition-transform hover:scale-110 hover:shadow-lg hover:z-10 relative';

export const heatmapCellClickable = 'cursor-pointer';

export const heatmapCellSelected =
  'outline outline-[3px] outline-orange-500 -outline-offset-2';

export const heatmapLegend =
  'flex items-center justify-center gap-2 mt-4 text-[0.85rem] text-gray-500 dark:text-slate-400';

export const legendScale = 'flex gap-[2px]';

export const legendScaleBox = 'w-[30px] h-4 rounded-sm';

// Peak hours & insights
export const peakHoursCharts =
  'grid grid-cols-1 md:grid-cols-2 gap-6';

export const peakHoursSectionH4 =
  'text-center text-gray-800 text-base mb-2 dark:text-slate-200';

export const insightsRecommendations =
  'flex flex-wrap gap-2 justify-center mb-4';

export const recommendationBadge =
  'bg-gradient-to-br from-indigo-400 to-purple-600 text-white px-3 py-1.5 rounded-full text-[0.85rem] font-medium';

// Instructor Comparison
export const comparisonInstructorSelector = 'mb-4';

export const instructorChips =
  'flex flex-wrap gap-1.5 justify-center';

export const instructorChip =
  'px-2.5 py-1.5 bg-gray-100 border-2 border-gray-300 rounded-full text-[0.8rem] cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:border-indigo-400';

export const instructorChipSelected = 'text-white';

export const moreInstructors =
  'px-2.5 py-1.5 text-gray-500 text-[0.8rem] italic dark:text-slate-400';

export const comparisonCharts =
  'grid grid-cols-1 md:grid-cols-2 gap-6';

export const comparisonSectionH4 =
  'text-center text-gray-800 text-base mb-2 dark:text-slate-200';

export const comparisonPlaceholder =
  'text-center text-gray-500 p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-400';

export const comparisonTableWrapper =
  'max-h-[280px] overflow-y-auto';

export const comparisonTable =
  'w-full border-collapse text-[0.85rem]';

export const comparisonTh =
  'sticky top-0 bg-indigo-400 px-2 py-2 text-left font-semibold text-white border-b border-gray-200';

export const comparisonTd =
  'px-2 py-2 text-left border-b border-gray-200 text-gray-700 dark:text-slate-300 dark:border-slate-700';
