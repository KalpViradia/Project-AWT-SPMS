'use client'

import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"
import { exportToExcel, exportToPDF, ExportColumn, ExportData } from "@/lib/export-utils"

interface ExportButtonsProps {
    data: ExportData[]
    columns: ExportColumn[]
    filename: string
    title?: string
}

export function ExportButtons({ data, columns, filename, title }: ExportButtonsProps) {
    const handleExcelExport = () => {
        exportToExcel(data, columns, filename)
    }

    const handlePDFExport = () => {
        exportToPDF(data, columns, filename, title)
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExcelExport}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handlePDFExport}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
            </Button>
        </div>
    )
}
