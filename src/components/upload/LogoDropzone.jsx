import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateLogoFile } from '../../utils/validators';
import { usePayroll } from '../../context/PayrollContext';
import { Icons } from '../shared/Icons';

const LogoDropzone = () => {
  const { logoFile, logoPreviewUrl, handleLogoUpload } = usePayroll();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateLogoFile(file);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    handleLogoUpload(file);
  }, [handleLogoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 2 * 1024 * 1024
  });

  return (
    <div className="dropzone-container">
      <div className="dropzone-label">
        <span className="dropzone-label-icon">{Icons.image}</span>
        <h3>Company Logo</h3>
        <span className="optional-tag">(Optional)</span>
      </div>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${logoFile ? 'dropzone-has-file' : ''}`}
      >
        <input {...getInputProps()} />
        {logoFile && logoPreviewUrl ? (
          <div className="dropzone-content">
            <div className="logo-preview-wrapper">
              <img src={logoPreviewUrl} alt="Logo preview" className="logo-preview" />
              <div className="file-details">
                <p className="file-name">{logoFile.name}</p>
                <p className="file-meta">Click to replace</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="dropzone-icon">{Icons.image}</div>
            <p className="dropzone-text">
              {isDragActive
                ? 'Drop image here...'
                : <>Drag & drop or <span>browse</span></>}
            </p>
            <p className="dropzone-hint">PNG, JPG, GIF, WebP (max 2MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoDropzone;
