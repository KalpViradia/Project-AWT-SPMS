"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SidebarContextType {
    isCollapsed: boolean
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const savedState = localStorage.getItem("sidebarCollapsed")
        if (savedState) {
            setIsCollapsed(savedState === "true")
        }
        setIsInitialized(true)
    }, [])

    const toggleSidebar = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem("sidebarCollapsed", String(newState))
    }

    // Avoid hydration mismatch by not rendering until initialized, or accept a flicker.
    // Better: Render children always, but maybe valid state only after init. 
    // For layout shift prevention, we might default to expanded.

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}
