"use client"

import * as React from "react"
import { SearchSelect } from "@/components/ui/search-select"

interface AcademicFilterSelectorProps {
  name: string
  items: { label: string; value: string }[]
  defaultValue?: string
  placeholder: string
}

export function AcademicFilterSelector({
  name,
  items,
  defaultValue,
  placeholder,
}: AcademicFilterSelectorProps) {
  const [value, setValue] = React.useState(defaultValue === "NaN" ? "" : (defaultValue || ""))

  return (
    <SearchSelect
      items={items}
      value={value}
      onValueChange={setValue}
      placeholder={placeholder}
      name={name}
    />
  )
}
