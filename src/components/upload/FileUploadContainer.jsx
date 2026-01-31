import React from 'react';
import FileDropzone from './FileDropzone';
import LogoDropzone from './LogoDropzone';
import { usePayroll } from '../../context/PayrollContext';
import { Icons } from '../shared/Icons';

const FileUploadContainer = () => {
  const { excelFile, processFiles, isLoading, error } = usePayroll();

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <div className="upload-header-icon">
            {Icons.dashboard}
          </div>
          <h1>Payroll Dashboard</h1>
          <p>File Upload</p>
        </div>

        <div className="upload-dropzones">
          <FileDropzone />
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
            disabled={!excelFile || isLoading}
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
