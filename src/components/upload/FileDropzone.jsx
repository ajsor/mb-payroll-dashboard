import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateExcelFile } from '../../utils/validators';
import { usePayroll } from '../../context/PayrollContext';
import { Icons } from '../shared/Icons';

const FileDropzone = () => {
  const { excelFile, handleExcelUpload } = usePayroll();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateExcelFile(file);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    handleExcelUpload(file);
  }, [handleExcelUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="dropzone-container">
      <div className="dropzone-label">
        <span className="dropzone-label-icon">{Icons.spreadsheet}</span>
        <h3>MindBody Payroll Report</h3>
      </div>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${excelFile ? 'dropzone-has-file' : ''}`}
      >
        <input {...getInputProps()} />
        {excelFile ? (
          <div className="dropzone-content">
            <div className="file-info">
              <div className="file-icon-wrapper">
                {Icons.fileCheck}
              </div>
              <div className="file-details">
                <p className="file-name">{excelFile.name}</p>
                <p className="file-meta">{formatFileSize(excelFile.size)} - Click to replace</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="dropzone-icon">{Icons.upload}</div>
            <p className="dropzone-text">
              {isDragActive
                ? 'Drop file here...'
                : <>Drag & drop or <span>browse</span></>}
            </p>
            <p className="dropzone-hint">Supports .xls and .xlsx (max 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;
