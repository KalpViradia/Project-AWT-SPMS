"use client"

import * as React from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, getDaysInMonth, setHours, setMinutes, getHours, getMinutes, parse } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateTimePickerProps {
    value?: string // ISO string or format compatible with new Date()
    onChange?: (value: string) => void
    placeholder?: string
    showTime?: boolean
    className?: string
    name?: string
    required?: boolean
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = "Select date & time",
    showTime = true,
    className,
    name,
    required = false,
}: DateTimePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
    const [monthOffset, setMonthOffset] = React.useState(0)
    const [isOpen, setIsOpen] = React.useState(false)

    // Temporary state for the picker before "Apply" is clicked
    const [tempDate, setTempDate] = React.useState<Date | undefined>(date)

    const currentMonth = addMonths(startOfMonth(new Date()), monthOffset)
    
    // Time states
    const hours = tempDate ? getHours(tempDate) : 12
    const minutes = tempDate ? getMinutes(tempDate) : 0
    const isPM = hours >= 12
    const displayHours = hours % 12 || 12

    const handleApply = () => {
        if (tempDate) {
            setDate(tempDate)
            onChange?.(tempDate.toISOString())
        }
        setIsOpen(false)
    }

    const handleToday = () => {
        const now = new Date()
        setTempDate(now)
        setMonthOffset(0)
    }

    const handleClear = () => {
        setTempDate(undefined)
        setDate(undefined)
        onChange?.("")
    }

    const renderCalendar = () => {
        const start = startOfWeek(startOfMonth(currentMonth))
        const end = endOfWeek(endOfMonth(currentMonth))
        const days = []
        let day = start

        while (day <= end) {
            days.push(day)
            day = addDays(day, 1)
        }

        return (
            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.preventDefault(); setMonthOffset(prev => prev - 1) }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        {format(currentMonth, "MMMM yyyy")}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.preventDefault(); setMonthOffset(prev => prev + 1) }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                        <div key={d} className="text-center text-[10px] uppercase text-muted-foreground font-semibold">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((d, i) => {
                        const isSelected = tempDate && isSameDay(d, tempDate)
                        const isCurrentMonth = isSameMonth(d, currentMonth)
                        const isToday = isSameDay(d, new Date())

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => {
                                    const newDate = tempDate ? new Date(tempDate) : new Date()
                                    newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
                                    setTempDate(newDate)
                                }}
                                className={cn(
                                    "h-8 w-8 rounded-md text-sm transition-colors relative flex items-center justify-center",
                                    !isCurrentMonth && "text-muted-foreground/30",
                                    isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent",
                                    isToday && !isSelected && "text-primary border border-primary/30"
                                )}
                            >
                                {format(d, "d")}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderTimePicker = () => {
        if (!showTime) return null

        const updateTime = (newHours: number, newMinutes: number) => {
            const d = tempDate ? new Date(tempDate) : new Date()
            d.setHours(newHours)
            d.setMinutes(newMinutes)
            setTempDate(d)
        }

        return (
            <div className="flex flex-col border-l border-border dark:border-white/10 min-w-[120px]">
                <div className="flex items-center gap-2 p-3 pb-2 text-xs font-semibold text-muted-foreground border-b border-border dark:border-white/10">
                    <Clock className="h-3 w-3" />
                    Time
                </div>
                <div className="flex flex-1">
                    {/* Hours */}
                    <ScrollArea className="h-[240px] w-12 border-r border-border dark:border-white/10">
                        <div className="flex flex-col p-1">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                                const actualHour = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
                                const isSelected = (hours % 12 || 12) === h
                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => updateTime(actualHour, minutes)}
                                        className={cn(
                                            "h-8 w-full rounded text-xs transition-colors",
                                            isSelected ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent"
                                        )}
                                    >
                                        {h.toString().padStart(2, '0')}
                                    </button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    {/* Minutes */}
                    <ScrollArea className="h-[240px] w-12 border-r border-border dark:border-white/10">
                        <div className="flex flex-col p-1">
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(m => {
                                const isSelected = Math.floor(minutes / 5) * 5 === m
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => updateTime(hours, m)}
                                        className={cn(
                                            "h-8 w-full rounded text-xs transition-colors",
                                            isSelected ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent"
                                        )}
                                    >
                                        {m.toString().padStart(2, '0')}
                                    </button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                    {/* AM/PM */}
                    <div className="flex flex-col p-1 gap-1">
                        <button
                            type="button"
                            onClick={() => updateTime(hours >= 12 ? hours - 12 : hours, minutes)}
                            className={cn(
                                "h-8 px-2 rounded text-[10px] font-bold transition-colors",
                                !isPM ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => updateTime(hours < 12 ? hours + 12 : hours, minutes)}
                            className={cn(
                                "h-8 px-2 rounded text-[10px] font-bold transition-colors",
                                isPM ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                        >
                            PM
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("relative", className)}>
            <Popover open={isOpen} onOpenChange={(v) => {
                setIsOpen(v)
                if (v) setTempDate(date) // Sync temp date when opening
            }}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal h-10 px-4 py-2 border-input dark:bg-input/30 hover:border-muted-foreground/50 transition-all",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        {date ? format(date, showTime ? "dd-MM-yyyy hh:mm a" : "dd-MM-yyyy") : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flex shadow-2xl border-border animate-in fade-in-0 zoom-in-95" align="start">
                    <div className="flex flex-col sm:flex-row">
                        <div className="flex flex-col">
                            {renderCalendar()}
                            <div className="flex items-center justify-between p-3 pt-0 gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                    onClick={(e) => { e.preventDefault(); handleClear() }}
                                >
                                    Clear
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-8"
                                        onClick={(e) => { e.preventDefault(); handleToday() }}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="text-xs h-8 bg-primary hover:bg-primary/90"
                                        onClick={(e) => { e.preventDefault(); handleApply() }}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {renderTimePicker()}
                    </div>
                </PopoverContent>
            </Popover>
            {/* Hidden input for form submission if name is provided */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={date ? (showTime ? date.toISOString() : format(date, "yyyy-MM-dd")) : ""}
                    required={required}
                />
            )}
        </div>
    )
}
