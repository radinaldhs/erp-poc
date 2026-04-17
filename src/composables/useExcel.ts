import * as XLSX from 'xlsx'

export interface ParsedExcel<T extends Record<string, unknown> = Record<string, unknown>> {
  sheetName: string
  headers: string[]
  rows: T[]
}

export async function parseFile<T extends Record<string, unknown> = Record<string, unknown>>(
  file: File
): Promise<ParsedExcel<T>> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<T>(sheet, { raw: false, defval: '' })
  const headers = Object.keys(rows[0] ?? {})
  return { sheetName, headers, rows }
}

export function downloadTemplate(
  name: string,
  headers: string[],
  sampleRows: Record<string, unknown>[] = []
): void {
  const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
  XLSX.writeFile(workbook, name.endsWith('.xlsx') ? name : `${name}.xlsx`)
}

export function downloadSheet(name: string, rows: Record<string, unknown>[]): void {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, name.endsWith('.xlsx') ? name : `${name}.xlsx`)
}

export function useExcel() {
  return { parseFile, downloadTemplate, downloadSheet }
}
