'use client'

import { ExportButtons } from "@/components/shared/export-buttons"
import { ExportColumn, ExportData } from "@/lib/export-utils"

interface FacultyGroupsExportClientProps {
    data: ExportData[]
    columns: ExportColumn[]
}

export function FacultyGroupsExportClient({ data, columns }: FacultyGroupsExportClientProps) {
    return (
        <ExportButtons
            data={data}
            columns={columns}
            filename="my_groups_report"
            title="My Project Groups Report"
        />
    )
}
