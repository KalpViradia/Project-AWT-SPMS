'use client'

import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportColumn {
  header: string
  key: string
}

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Export data to Excel (.xlsx) file
 */
export function exportToExcel(
  data: ExportData[],
  columns: ExportColumn[],
  filename: string
) {
  // Transform data to match column headers
  const worksheetData = data.map((row) => {
    const newRow: { [key: string]: string | number | boolean | null | undefined } = {}
    columns.forEach((col) => {
      newRow[col.header] = row[col.key]
    })
    return newRow
  })

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  // Auto-size columns
  const colWidths = columns.map((col) => ({
    wch: Math.max(
      col.header.length,
      ...data.map((row) => String(row[col.key] ?? '').length)
    ),
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Export data to PDF file
 */
export function exportToPDF(
  data: ExportData[],
  columns: ExportColumn[],
  filename: string,
  title?: string
) {
  const doc = new jsPDF()

  // Add title if provided
  if (title) {
    doc.setFontSize(16)
    doc.text(title, 14, 20)
  }

  // Prepare table data
  const headers = columns.map((col) => col.header)
  const rows = data.map((row) =>
    columns.map((col) => String(row[col.key] ?? ''))
  )

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: title ? 30 : 20,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  doc.save(`${filename}.pdf`)
}
