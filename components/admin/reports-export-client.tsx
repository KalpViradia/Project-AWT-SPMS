'use client'

import { ExportButtons } from "@/components/shared/export-buttons"
import { ExportColumn, ExportData } from "@/lib/export-utils"

interface ReportsExportClientProps {
    data: ExportData[]
    columns: ExportColumn[]
}

export function ReportsExportClient({ data, columns }: ReportsExportClientProps) {
    return (
        <ExportButtons
            data={data}
            columns={columns}
            filename="spms_projects_report"
            title="SPMS - All Projects Report"
        />
    )
}
