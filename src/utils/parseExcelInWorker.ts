// Thin main-thread wrapper around excelParser.worker.ts.
// Exposes the same shape (`parseExcelFile(file) → Promise<result>`) as the
// old synchronous-on-main-thread implementation, so call sites don't need
// any logic changes.

import ExcelParserWorker from '../workers/excelParser.worker.ts?worker'

type DateRange = { startDate: string; endDate: string; raw: string } | null

export type ParsedRow = {
  instructorName: string
  className?: string
  classDate?: string
  classTime?: string
  staffPaid?: number
  earnings?: number
}

export type ParseResult = {
  dateRange: DateRange
  payrollData: ParsedRow[]
  rowCount: number
}

type WorkerOut =
  | { ok: true; result: ParseResult }
  | { ok: false; error: string }

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const worker = new ExcelParserWorker()
    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      if (e.data.ok) resolve(e.data.result)
      else reject(new Error(e.data.error))
      worker.terminate()
    }
    worker.onerror = (e) => {
      reject(new Error(e.message || 'Worker failed while parsing Excel file'))
      worker.terminate()
    }
    worker.postMessage({ file })
  })
}
