'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface ConsoleLog {
  id: string
  message: string
  type: 'log' | 'error' | 'warning' | 'success'
  timestamp: number
}

interface ConsoleContextType {
  logs: ConsoleLog[]
  addLog: (message: string, type?: 'log' | 'error' | 'warning' | 'success') => void
  clearLogs: () => void
  isCompiling: boolean
  setIsCompiling: (compiling: boolean) => void
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined)

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ConsoleLog[]>([])
  const [isCompiling, setIsCompiling] = useState(false)

  const addLog = (message: string, type: 'log' | 'error' | 'warning' | 'success' = 'log') => {
    const newLog: ConsoleLog = {
      id: Math.random().toString(36).slice(2, 11),
      message,
      type,
      timestamp: Date.now(),
    }
    setLogs((prev) => [...prev, newLog])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const value: ConsoleContextType = {
    logs,
    addLog,
    clearLogs,
    isCompiling,
    setIsCompiling,
  }

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
}

export function useConsole() {
  const context = useContext(ConsoleContext)
  if (!context) {
    throw new Error('useConsole must be used within ConsoleProvider')
  }
  return context
}
