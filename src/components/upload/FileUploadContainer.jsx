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
    <div className="max-w-[680px] mx-auto my-8 px-6">
      <div className="rounded-2xl bg-white py-5 px-10 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_12px_rgba(0,0,0,0.06)] dark:bg-slate-800 dark:border-slate-700">
        <div className="text-center mb-5">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            {Icons.spreadsheet}
          </div>
          <h1 className="mb-2 text-[1.625rem] font-semibold tracking-tight text-gray-900 dark:text-slate-100">Payroll Dashboard</h1>
          <p className="text-[15px] leading-[1.5] text-gray-500 dark:text-slate-400">File Upload</p>
        </div>

        <div className="flex flex-col gap-5 mb-6">
          <FileDropzone />
          <FirstVisitDropzone />
          <LogoDropzone />
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300 [&_svg]:shrink-0">
            {Icons.alertCircle}
            <span>{error}</span>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={processFiles}
            disabled={!hasReportFile || isLoading}
            className="inline-flex items-center gap-2 rounded-[10px] border-0 bg-indigo-500 px-8 py-3 text-[15px] font-medium text-white cursor-pointer transition-all hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:w-[18px] [&_svg]:h-[18px]"
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-flex">{Icons.loader}</span>
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
