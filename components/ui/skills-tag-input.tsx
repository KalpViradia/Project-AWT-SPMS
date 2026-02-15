"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"

interface SkillsTagInputProps {
    name: string
    label?: string
    initialSkills?: string[]
    onChange?: (skills: string[]) => void
    placeholder?: string
}

export function SkillsTagInput({
    name,
    label,
    initialSkills = [],
    onChange,
    placeholder = "Type a skill and press Enter",
}: SkillsTagInputProps) {
    const [skills, setSkills] = useState<string[]>(initialSkills)
    const [inputValue, setInputValue] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    function addSkill(raw: string) {
        const skill = raw.trim()
        if (skill && !skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
            const updated = [...skills, skill]
            setSkills(updated)
            onChange?.(updated)
        }
        setInputValue("")
        inputRef.current?.focus()
    }

    function removeSkill(index: number) {
        const updated = skills.filter((_, i) => i !== index)
        setSkills(updated)
        onChange?.(updated)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addSkill(inputValue)
        }
        if (e.key === "Backspace" && inputValue === "" && skills.length > 0) {
            removeSkill(skills.length - 1)
        }
    }

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div className="flex gap-2">
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (inputValue.trim()) addSkill(inputValue)
                    }}
                    placeholder={placeholder}
                    className="flex-1"
                />
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => addSkill(inputValue)}
                    disabled={!inputValue.trim()}
                    className="shrink-0"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {skills.map((skill, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => removeSkill(i)}
                                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={JSON.stringify(skills)} />
            <p className="text-[0.8rem] text-muted-foreground">
                Press Enter or comma to add. Click × to remove.
            </p>
        </div>
    )
}
