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

  const dzState = logoFile
    ? 'border-solid border-emerald-500 bg-emerald-50 hover:border-emerald-600 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-900/40'
    : isDragActive
      ? 'border-solid border-indigo-500 bg-violet-100 dark:border-indigo-500 dark:bg-indigo-950/60'
      : 'border-dashed border-gray-300 bg-neutral-50 hover:border-indigo-500 hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50';

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-5 h-5 text-gray-500 dark:text-slate-400">{Icons.image}</span>
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200 m-0">Company Logo</h3>
        <span className="text-xs font-normal text-gray-400 dark:text-slate-500">(Optional)</span>
      </div>
      <div
        {...getRootProps()}
        className={`group flex items-center justify-center min-h-[140px] rounded-xl border-2 p-8 px-6 text-center cursor-pointer transition-all ${dzState}`}
      >
        <input {...getInputProps()} />
        {logoFile && logoPreviewUrl ? (
          <div className="flex w-full flex-col items-center">
            <div className="flex items-center gap-4">
              <img
                src={logoPreviewUrl}
                alt="Logo preview"
                className="max-w-[80px] max-h-[60px] object-contain rounded-md border border-gray-200 dark:border-slate-600"
              />
              <div className="min-w-0 text-left">
                <p className="m-0 mb-0.5 break-words text-sm font-medium text-gray-900 dark:text-slate-100">{logoFile.name}</p>
                <p className="m-0 text-xs text-gray-500 dark:text-slate-400">Click to replace</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            <div className="w-10 h-10 mb-3.5 text-gray-400 transition-colors group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-400">{Icons.image}</div>
            <p className="mb-1.5 text-[15px] font-medium text-gray-700 dark:text-slate-200">
              {isDragActive
                ? 'Drop image here...'
                : <>Drag & drop or <span className="text-indigo-500">browse</span></>}
            </p>
            <p className="text-[13px] text-gray-400 dark:text-slate-500">PNG, JPG, GIF, WebP (max 2MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoDropzone;
