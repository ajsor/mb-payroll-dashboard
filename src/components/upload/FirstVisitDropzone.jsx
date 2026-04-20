import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { validateExcelFile } from '../../utils/validators';
import { usePayroll } from '../../context/PayrollContext';
import { Icons } from '../shared/Icons';

const FirstVisitDropzone = () => {
  const { firstVisitFile, handleFirstVisitUpload } = usePayroll();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateExcelFile(file);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    handleFirstVisitUpload(file);
  }, [handleFirstVisitUpload]);

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

  const dzState = firstVisitFile
    ? 'border-solid border-emerald-500 bg-emerald-50 hover:border-emerald-600 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-900/40'
    : isDragActive
      ? 'border-solid border-indigo-500 bg-violet-100 dark:border-indigo-500 dark:bg-indigo-950/60'
      : 'border-dashed border-gray-300 bg-neutral-50 hover:border-indigo-500 hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50';

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-5 h-5 text-gray-500 dark:text-slate-400">{Icons.spreadsheet}</span>
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200 m-0">MindBody First Visit Report</h3>
      </div>
      <div
        {...getRootProps()}
        className={`group flex items-center justify-center min-h-[140px] rounded-xl border-2 p-8 px-6 text-center cursor-pointer transition-all ${dzState}`}
      >
        <input {...getInputProps()} />
        {firstVisitFile ? (
          <div className="flex w-full flex-col items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-emerald-500 text-white">
                {Icons.fileCheck}
              </div>
              <div className="min-w-0 text-left">
                <p className="m-0 mb-0.5 break-words text-sm font-medium text-gray-900 dark:text-slate-100">{firstVisitFile.name}</p>
                <p className="m-0 text-xs text-gray-500 dark:text-slate-400">{formatFileSize(firstVisitFile.size)} - Click to replace</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            <div className="w-10 h-10 mb-3.5 text-gray-400 transition-colors group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-400">{Icons.upload}</div>
            <p className="mb-1.5 text-[15px] font-medium text-gray-700 dark:text-slate-200">
              {isDragActive
                ? 'Drop file here...'
                : <>Drag & drop or <span className="text-indigo-500">browse</span></>}
            </p>
            <p className="text-[13px] text-gray-400 dark:text-slate-500">Supports .xls and .xlsx (max 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirstVisitDropzone;
