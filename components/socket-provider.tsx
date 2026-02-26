"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import { getSocket } from "@/lib/socket-client"
import type { Socket } from "socket.io-client"

const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
    return useContext(SocketContext)
}

interface SocketProviderProps {
    userId: number
    userRole: string
    children: React.ReactNode
}

export function SocketProvider({ userId, userRole, children }: SocketProviderProps) {
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        const socket = getSocket()
        socketRef.current = socket

        // Join user notification room
        socket.emit("join:user", { userId, userRole })

        return () => {
            socket.disconnect()
        }
    }, [userId, userRole])

    return (
        <SocketContext.Provider value={socketRef.current ?? getSocket()}>
            {children}
        </SocketContext.Provider>
    )
}
