"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

interface SocketContextType {
    socket: Socket | null
    isLive: boolean
    isWaking: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isLive: false,
    isWaking: false,
})

export function useSocket() {
    return useContext(SocketContext)
}

interface SocketProviderProps {
    userId: number
    userRole: string
    children: React.ReactNode
}

export function SocketProvider({ userId, userRole, children }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isLive, setIsLive] = useState(false)
    const [isWaking, setIsWaking] = useState(false)

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
        let retryCount = 0
        const MAX_RETRIES = 5
        let currentTimeout: NodeJS.Timeout

        const checkBackend = async () => {
            if (retryCount >= MAX_RETRIES) {
                setIsWaking(false)
                return
            }

            try {
                const res = await fetch(`${socketUrl}/health`, { 
                    method: "GET",
                    signal: AbortSignal.timeout(5000),
                    mode: 'cors'
                })

                if (res.ok) {
                    setIsLive(true)
                    setIsWaking(false)
                } else {
                    throw new Error("Backend not responding")
                }
            } catch (err: any) {
                // If CORS error (type 'error' and no status), or other network failure
                if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                    console.error("[Socket.IO] Potential CORS or network error. Stopping retries.")
                    setIsWaking(false)
                    return
                }

                retryCount++
                setIsWaking(true)
                setIsLive(false)
                
                currentTimeout = setTimeout(checkBackend, 5000)
            }
        }

        // Start checking once on mount
        checkBackend()

        const s = io(socketUrl, {
            transports: ["websocket", "polling"],
        })

        s.on("connect", () => {
            setIsLive(true)
            setIsWaking(false)
            if (currentTimeout) clearTimeout(currentTimeout)
            s.emit("join:user", { userId, userRole })
        })

        s.on("disconnect", () => {
            setIsLive(false)
        })

        setSocket(s)

        return () => {
            s.disconnect()
            if (currentTimeout) clearTimeout(currentTimeout)
        }
    }, [userId, userRole]) // stable dependencies

    return (
        <SocketContext.Provider value={{ socket, isLive, isWaking }}>
            {children}
        </SocketContext.Provider>
    )
}
