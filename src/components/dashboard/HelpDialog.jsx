import React, { useEffect } from 'react';
import { Icons, SmallIcons } from '../shared/Icons';

const HelpDialog = ({ onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="help-dialog-overlay" onClick={onClose}>
      <div className="help-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="help-dialog-header">
          <h2>Welcome to Payroll Dashboard</h2>
          <button className="help-dialog-close" onClick={onClose} title="Close">
            {Icons.close}
          </button>
        </div>

        <div className="help-dialog-content">
          <section className="help-section">
            <h3>Getting Started</h3>
            <p>Upload your MindBody payroll report Excel file to generate interactive visualizations of instructor earnings, class attendance, and performance metrics.</p>
          </section>

          <section className="help-section">
            <h3>Navigation Views</h3>
            <p>Use the navigation tabs to filter charts by category:</p>
            <ul>
              <li><strong>All</strong> - View all charts at once</li>
              <li><strong>Payroll</strong> - Earnings and payment data</li>
              <li><strong>Classes</strong> - Class popularity, frequency, and attendance patterns</li>
              <li><strong>Instructors</strong> - Individual instructor performance and comparisons</li>
              <li><strong>Insights</strong> - Trends, peak hours, and performance analysis</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Toolbar Icons</h3>
            <div className="help-icon-list">
              <div className="help-icon-item">
                <span className="help-icon">{SmallIcons.calendar}</span>
                <span><strong>Date Filter</strong> - Filter data by date range using presets or custom dates</span>
              </div>
              <div className="help-icon-item">
                <span className="help-icon">{SmallIcons.user}</span>
                <span><strong>Instructor Filter</strong> - Show data for specific instructors only</span>
              </div>
              <div className="help-icon-item">
                <span className="help-icon">{SmallIcons.download}</span>
                <span><strong>Export</strong> - Download data as Excel, CSV, or print to PDF</span>
              </div>
              <div className="help-icon-item">
                <span className="help-icon">{SmallIcons.upload}</span>
                <span><strong>Upload</strong> - Load a new payroll file</span>
              </div>
              <div className="help-icon-item">
                <span className="help-icon">{SmallIcons.moon}</span>
                <span><strong>Dark Mode</strong> - Toggle between light and dark themes</span>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>Interactive Charts</h3>
            <ul>
              <li><strong>Click on bars</strong> in many charts to view detailed session data</li>
              <li><strong>Hover</strong> over chart elements to see tooltips with more information</li>
              <li><strong>Sort tables</strong> by clicking column headers</li>
              <li><strong>Scroll</strong> within charts that have many items to see all data</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Tips</h3>
            <ul>
              <li>The date range shown in the toolbar reflects your current filter</li>
              <li>Active filters are indicated by a blue dot on their icons</li>
              <li>Use the Instructor Comparison chart to compare up to 4 instructors side-by-side</li>
              <li>The Peak Hours chart helps identify optimal scheduling times</li>
            </ul>
          </section>
        </div>

        <div className="help-dialog-footer">
          <button className="help-dialog-btn" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  );
};

export default HelpDialog;
