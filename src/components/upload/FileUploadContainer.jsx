import React from 'react';
import FileDropzone from './FileDropzone';
import FirstVisitDropzone from './FirstVisitDropzone';
import LogoDropzone from './LogoDropzone';
import { usePayroll } from '../../context/PayrollContext';
import { Icons } from '../shared/Icons';

const FileUploadContainer = () => {
  const { excelFile, firstVisitFile, processFiles, isLoading, error } = usePayroll();

  // Enable button if at least one report file is uploaded
  const hasReportFile = excelFile || firstVisitFile;

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h1>Payroll Dashboard</h1>
          <p>File Upload</p>
        </div>

        <div className="upload-dropzones">
          <FileDropzone />
          <FirstVisitDropzone />
          <LogoDropzone />
        </div>

        {error && (
          <div className="error-message">
            {Icons.alertCircle}
            <span>{error}</span>
          </div>
        )}

        <div className="upload-actions">
          <button
            onClick={processFiles}
            disabled={!hasReportFile || isLoading}
            className="process-button"
          >
            {isLoading ? (
              <>
                {Icons.loader}
                Processing...
              </>
            ) : (
              <>
                Generate Dashboard
                {Icons.arrowRight}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadContainer;
