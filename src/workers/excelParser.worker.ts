/// <reference lib="webworker" />
// Web Worker: Excel payroll report parser.
// Moved off the main thread so the UI stays responsive while processing
// 300+ sheet workbooks. All logic in this file is a direct port of the
// previous src/utils/excelParser.js; no behavior changes intended.

import * as XLSX from 'xlsx'

type ParsedRow = {
  instructorName: string
  className?: string
  classDate?: string
  classTime?: string
  staffPaid?: number
  earnings?: number
}

type DateRange = { startDate: string; endDate: string; raw: string } | null

type ParseResult = {
  dateRange: DateRange
  payrollData: ParsedRow[]
  rowCount: number
}

type ColumnMapping = {
  className?: number
  classDate?: number
  classTime?: number
  staffPaid?: number
  earnings?: number
  basePay?: number
  bonusPay?: number
}

type InMessage = { file: File }

type OutMessage =
  | { ok: true; result: ParseResult }
  | { ok: false; error: string }

const worker = self as unknown as DedicatedWorkerGlobalScope

const DATE_RANGE_PATTERNS: RegExp[] = [
  /(\d{1,2}\/\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{1,2}\/\d{4})/,
  /(\d{1,2}-\d{1,2}-\d{4})\s*[-–—]\s*(\d{1,2}-\d{1,2}-\d{4})/,
  /(\d{4}\/\d{1,2}\/\d{1,2})\s*[-–—]\s*(\d{4}\/\d{1,2}\/\d{1,2})/,
  /(\w+,\s+\w+\s+\d{1,2},\s+\d{4})\s*[-–—]\s*(\w+,\s+\w+\s+\d{1,2},\s+\d{4})/,
  /([A-Za-z]+,\s*[A-Za-z]+\s+\d+,\s+\d{4})\s*[-–—]\s*([A-Za-z]+,\s*[A-Za-z]+\s+\d+,\s+\d{4})/,
]

function extractInstructorFromTotal(text: unknown): string | null {
  const match = String(text).match(/Total for\s+(.+)/i)
  return match ? match[1].trim() : null
}

function extractDateRange(rows: unknown[][]): DateRange {
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i]
    if (!row) continue
    for (const cell of row) {
      if (!cell) continue
      const cellStr = String(cell).trim()
      for (const pattern of DATE_RANGE_PATTERNS) {
        const match = cellStr.match(pattern)
        if (match) return { startDate: match[1], endDate: match[2], raw: cellStr }
      }
    }
  }
  return null
}

function isInstructorNameRow(row: unknown[] | undefined): boolean {
  if (!row || row.length === 0) return false
  const nonEmpty = row.filter((c) => c !== null && c !== undefined && c !== '')
  if (nonEmpty.length !== 1) return false
  const text = String(nonEmpty[0]).trim()
  return (
    text.includes(',') &&
    text.length < 100 &&
    text.length > 3 &&
    !text.toLowerCase().includes('pay rate') &&
    !text.includes('–') &&
    !text.includes('—') &&
    !text.toLowerCase().includes('class/') &&
    !text.toLowerCase().includes('date')
  )
}

function isHeaderRow(row: unknown[] | undefined): boolean {
  if (!row || row.length < 3) return false
  const lower = row.map((c) => (c ? String(c).toLowerCase().trim() : ''))
  const hasDate = lower.some((c) => c.includes('date'))
  const hasEarnings = lower.some((c) => c.includes('earning') || c.includes('pay'))
  const hasClassName = lower.some((c) => c.includes('class') || c.includes('name'))
  return hasDate && hasEarnings && hasClassName
}

function mapHeaders(headers: unknown[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  headers.forEach((header, index) => {
    if (!header) return
    const h = String(header).toLowerCase().trim()
    if (h.includes('class') && h.includes('name')) mapping.className = index
    else if (h.includes('class') && h.includes('date')) mapping.classDate = index
    else if (h.includes('class') && h.includes('time')) mapping.classTime = index
    else if ((h.includes('staff') && h.includes('paid') && !h.includes('unpaid')) || h === '# staff paid')
      mapping.staffPaid = index
    else if (h.includes('earning')) mapping.earnings = index
    else if (h.includes('base') && h.includes('pay')) mapping.basePay = index
    else if (h.includes('bonus') && h.includes('pay')) mapping.bonusPay = index
  })
  return mapping
}

function excelDateToString(excelDate: unknown): string {
  if (typeof excelDate === 'string') return excelDate
  if (!excelDate || (typeof excelDate === 'number' && isNaN(excelDate))) return ''
  const n = Number(excelDate)
  if (isNaN(n)) return ''
  const date = new Date((n - 25569) * 86400 * 1000)
  return date.toLocaleDateString()
}

function parseDataRow(row: unknown[], mapping: ColumnMapping, currentInstructorName: string): ParsedRow {
  const obj: ParsedRow = { instructorName: currentInstructorName }

  if (mapping.className !== undefined) {
    const v = row[mapping.className]
    obj.className = v ? String(v).trim() : ''
  }
  if (mapping.classDate !== undefined) obj.classDate = excelDateToString(row[mapping.classDate])
  if (mapping.classTime !== undefined) {
    const v = row[mapping.classTime]
    if (typeof v === 'number' && v < 1) {
      const hours = Math.floor(v * 24)
      const minutes = Math.round((v * 24 - hours) * 60)
      obj.classTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    } else {
      obj.classTime = v ? String(v).trim() : ''
    }
  }
  if (mapping.staffPaid !== undefined) {
    const v = row[mapping.staffPaid]
    obj.staffPaid = v ? Number(v) : 0
  }
  if (mapping.earnings !== undefined) {
    const v = row[mapping.earnings]
    if (v === null || v === undefined || v === '') {
      obj.earnings = 0
    } else {
      const cleaned = String(v).replace(/[$,\s]/g, '')
      const parsed = parseFloat(cleaned)
      obj.earnings = isNaN(parsed) ? 0 : parsed
    }
  }
  if (obj.earnings === 0 && mapping.basePay !== undefined && mapping.bonusPay !== undefined) {
    const base = parseFloat(String(row[mapping.basePay])) || 0
    const bonus = parseFloat(String(row[mapping.bonusPay])) || 0
    obj.earnings = base + bonus
  }
  return obj
}

function parseSheet(rows: unknown[][], instructorName: string): ParsedRow[] {
  const out: ParsedRow[] = []
  let currentInstructorName = instructorName
  let currentMapping: ColumnMapping | null = null

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0 || !row.some((c) => c)) continue
    if (row[0] && String(row[0]).includes('Total for')) continue

    if (isInstructorNameRow(row)) {
      currentInstructorName = String(row[0]).trim()
      continue
    }

    if (isHeaderRow(row)) {
      currentMapping = mapHeaders(row)
      if (!currentInstructorName) {
        for (let j = Math.max(0, i - 5); j < i; j++) {
          if (isInstructorNameRow(rows[j])) {
            currentInstructorName = String(rows[j][0]).trim()
            break
          }
        }
      }
      continue
    }

    if (currentMapping && currentInstructorName) {
      const obj = parseDataRow(row, currentMapping, currentInstructorName)
      if (obj.className || obj.classDate) out.push(obj)
    }
  }

  return out
}

async function parseExcelFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer()
  const data = new Uint8Array(buffer)
  const workbook = XLSX.read(data, { type: 'array' })

  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 })

  if (!rows || rows.length === 0) throw new Error('Excel file appears to be empty')

  let dateRange = extractDateRange(rows)
  if (!dateRange && file.name) {
    const filenameMatch = file.name.match(/(\d{1,2}-\d{1,2}-\d{4})\s*-\s*(\d{1,2}-\d{1,2}-\d{4})/)
    if (filenameMatch) {
      dateRange = { startDate: filenameMatch[1], endDate: filenameMatch[2], raw: `${filenameMatch[1]} - ${filenameMatch[2]}` }
    }
  }

  const allPayrollData: ParsedRow[] = []

  // FIRST PASS: map each sheet index to an instructor name based on "Total for X" rows
  const instructorMap = new Map<number, string>()
  let currentInstructor: string | null = null
  let sectionStartIndex = 0

  for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
    const sheetName = workbook.SheetNames[sheetIndex]
    const sheet = workbook.Sheets[sheetName]
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
    for (const row of sheetRows) {
      if (row && row[0] && String(row[0]).includes('Total for')) {
        const instructorName = extractInstructorFromTotal(row[0])
        if (instructorName) {
          for (let i = sectionStartIndex; i <= sheetIndex; i++) instructorMap.set(i, instructorName)
          currentInstructor = instructorName
          sectionStartIndex = sheetIndex + 1
          break
        }
      }
    }
  }
  if (sectionStartIndex < workbook.SheetNames.length && currentInstructor) {
    for (let i = sectionStartIndex; i < workbook.SheetNames.length; i++) {
      instructorMap.set(i, currentInstructor)
    }
  }

  // SECOND PASS: process every sheet's data rows with the assigned instructor
  for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
    const sheetName = workbook.SheetNames[sheetIndex]
    const sheet = workbook.Sheets[sheetName]
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
    if (sheetRows.length === 0) continue
    const instructorName = instructorMap.get(sheetIndex) ?? `Instructor ${sheetIndex + 1}`
    const sheetData = parseSheet(sheetRows, instructorName)
    if (sheetData.length > 0) allPayrollData.push(...sheetData)
  }

  if (allPayrollData.length === 0) {
    throw new Error('No valid data rows found in Excel file. Please check that your file has class data with dates and class names.')
  }

  return { dateRange, payrollData: allPayrollData, rowCount: allPayrollData.length }
}

worker.onmessage = async (e: MessageEvent<InMessage>) => {
  try {
    const result = await parseExcelFile(e.data.file)
    const msg: OutMessage = { ok: true, result }
    worker.postMessage(msg)
  } catch (err) {
    const msg: OutMessage = { ok: false, error: err instanceof Error ? err.message : String(err) }
    worker.postMessage(msg)
  }
}
