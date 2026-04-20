import React, { useEffect } from 'react';
import { Icons, SmallIcons } from '../shared/Icons';

const HelpDialog = ({ onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const sectionH3 = 'text-[0.9375rem] font-semibold text-gray-900 mb-2.5 dark:text-slate-100';
  const sectionP = 'text-sm leading-[1.6] text-gray-600 mb-2 dark:text-slate-400';
  const sectionLi = 'text-sm leading-[1.6] text-gray-600 mb-1.5 dark:text-slate-400';

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-[600px] flex-col rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-[dialogSlideIn_0.2s_ease-out] dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <h2 className="m-0 text-xl font-semibold text-gray-900 dark:text-slate-100">Welcome to Payroll Dashboard</h2>
          <button
            onClick={onClose}
            title="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-gray-500 cursor-pointer transition-all hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            {Icons.close}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <section className="mb-6 last:mb-0">
            <h3 className={sectionH3}>Getting Started</h3>
            <p className={sectionP}>Upload your MindBody payroll report Excel file to generate interactive visualizations of instructor earnings, class attendance, and performance metrics.</p>
          </section>

          <section className="mb-6 last:mb-0">
            <h3 className={sectionH3}>Navigation Views</h3>
            <p className={sectionP}>Use the navigation tabs to filter charts by category:</p>
            <ul className="m-0 pl-5">
              <li className={sectionLi}><strong>All</strong> - View all charts at once</li>
              <li className={sectionLi}><strong>Payroll</strong> - Earnings and payment data</li>
              <li className={sectionLi}><strong>Classes</strong> - Class popularity, frequency, and attendance patterns</li>
              <li className={sectionLi}><strong>Instructors</strong> - Individual instructor performance and comparisons</li>
              <li className={sectionLi + ' last:mb-0'}><strong>Insights</strong> - Trends, peak hours, and performance analysis</li>
            </ul>
          </section>

          <section className="mb-6 last:mb-0">
            <h3 className={sectionH3}>Toolbar Icons</h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: SmallIcons.calendar, title: 'Date Filter', desc: 'Filter data by date range using presets or custom dates' },
                { icon: SmallIcons.user, title: 'Instructor Filter', desc: 'Show data for specific instructors only' },
                { icon: SmallIcons.download, title: 'Export', desc: 'Download data as Excel, CSV, or print to PDF' },
                { icon: SmallIcons.upload, title: 'Upload', desc: 'Load a new payroll file' },
                { icon: SmallIcons.moon, title: 'Dark Mode', desc: 'Toggle between light and dark themes' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-indigo-500 dark:bg-slate-700 dark:text-indigo-400">{item.icon}</span>
                  <span className="pt-1 text-sm leading-[1.5] text-gray-600 dark:text-slate-400"><strong>{item.title}</strong> - {item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6 last:mb-0">
            <h3 className={sectionH3}>Interactive Charts</h3>
            <ul className="m-0 pl-5">
              <li className={sectionLi}><strong>Click on bars</strong> in many charts to view detailed session data</li>
              <li className={sectionLi}><strong>Hover</strong> over chart elements to see tooltips with more information</li>
              <li className={sectionLi}><strong>Sort tables</strong> by clicking column headers</li>
              <li className={sectionLi + ' last:mb-0'}><strong>Scroll</strong> within charts that have many items to see all data</li>
            </ul>
          </section>

          <section className="mb-6 last:mb-0">
            <h3 className={sectionH3}>Tips</h3>
            <ul className="m-0 pl-5">
              <li className={sectionLi}>The date range shown in the toolbar reflects your current filter</li>
              <li className={sectionLi}>Active filters are indicated by a blue dot on their icons</li>
              <li className={sectionLi}>Use the Instructor Comparison chart to compare up to 4 instructors side-by-side</li>
              <li className={sectionLi + ' last:mb-0'}>The Peak Hours chart helps identify optimal scheduling times</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="rounded-lg border-0 bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white cursor-pointer transition-colors hover:bg-indigo-600"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpDialog;
