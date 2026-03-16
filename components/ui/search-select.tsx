"use client"

import * as React from "react"
import { Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command as CommandPrimitive } from "cmdk"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

export interface SearchSelectItem {
  label: string
  value: string
  [key: string]: any
}

interface SearchSelectProps {
  items: SearchSelectItem[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  name?: string
  renderItem?: (item: SearchSelectItem) => React.ReactNode
  onBlur?: () => void
  autoFocus?: boolean
}

export function SearchSelect({
  items,
  value,
  onValueChange,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  className,
  name,
  renderItem,
  onBlur,
  autoFocus = false,
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  // Find current label for display
  const selectedItem = React.useMemo(() => items.find((item) => item.value === value), [items, value])
  const [query, setQuery] = React.useState(selectedItem?.label || "")

  // Sync query when value changes from outside
  React.useEffect(() => {
    if (selectedItem) {
      setQuery(selectedItem.label)
    } else if (!value) {
      setQuery("")
    }
  }, [selectedItem, value])

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        onBlur?.() 
      }
    }
    if (open) {
        document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onBlur])

  // Restore query when dropdown closes
  React.useEffect(() => {
    if (!open) {
      if (selectedItem) {
        setQuery(selectedItem.label)
      } else {
        setQuery("")
      }
    }
  }, [open, selectedItem])

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <CommandPrimitive className="flex h-full w-full flex-col overflow-visible rounded-lg border border-input bg-card shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
        <div className="flex h-10 items-center gap-2 px-3" data-slot="search-select-input-wrapper">
          <Search className="size-4 shrink-0 opacity-50" />
          <CommandPrimitive.Input
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            onFocus={() => {
              setOpen(true)
              setQuery("") // Clear on focus to allow searching
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Tab") {
                setOpen(false)
              }
            }}
            autoFocus={autoFocus}
            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none"
            style={{ border: 'none', boxShadow: 'none', outline: 'none' }}
          />
        </div>
        
        {open && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover text-popover-foreground border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.label}
                      onSelect={() => {
                        onValueChange?.(item.value)
                        setQuery(item.label)
                        setOpen(false)
                      }}
                      className="py-2.5 cursor-pointer px-3 aria-selected:bg-accent aria-selected:text-accent-foreground flex items-center gap-2"
                    >
                      <div className="flex-1">
                        {renderItem ? renderItem(item) : <span className="font-medium">{item.label}</span>}
                      </div>
                      {value === item.value && <Check className="h-4 w-4 text-primary" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </div>
        )}
      </CommandPrimitive>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  )
}
