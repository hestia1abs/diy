'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface ConsoleLog {
  id: string
  message: string
  type: 'log' | 'error' | 'warning' | 'success'
  timestamp: number
}

export interface Problem {
  id: string
  file: string
  line: number
  column: number
  severity: 'error' | 'warning' | 'info'
  message: string
}

export interface BuildProgress {
  status: 'idle' | 'compiling' | 'success' | 'error'
  percentage: number
  currentStep: string
}

export interface SerialConfig {
  baudRate: number
  connected: boolean
  port: string | null
}

interface ConsoleContextType {
  // Build output
  logs: ConsoleLog[]
  addLog: (message: string, type?: ConsoleLog['type']) => void
  clearLogs: () => void

  // Serial monitor
  serialLogs: ConsoleLog[]
  addSerialLog: (message: string, type?: ConsoleLog['type']) => void
  clearSerialLogs: () => void
  serialConfig: SerialConfig
  setSerialConfig: (config: Partial<SerialConfig>) => void

  // Problems
  problems: Problem[]
  addProblem: (problem: Omit<Problem, 'id'>) => void
  clearProblems: () => void

  // Build state
  buildProgress: BuildProgress
  setBuildProgress: (progress: Partial<BuildProgress>) => void
  isCompiling: boolean
  setIsCompiling: (compiling: boolean) => void

  // Active bottom tab
  activeBottomTab: 'output' | 'serial' | 'problems'
  setActiveBottomTab: (tab: 'output' | 'serial' | 'problems') => void
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined)

let logCounter = 0

function MakeId(): string {
  return `log_${++logCounter}_${Date.now()}`
}

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ConsoleLog[]>([
    { id: 'init', message: 'Hestia DIY Editor — Ready', type: 'log', timestamp: Date.now() },
    { id: 'init2', message: 'Select a board and click Compile to build firmware.', type: 'log', timestamp: Date.now() },
  ])
  const [serialLogs, setSerialLogs] = useState<ConsoleLog[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [isCompiling, setIsCompiling] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState<'output' | 'serial' | 'problems'>('output')

  const [buildProgress, setBuildProgressState] = useState<BuildProgress>({
    status: 'idle',
    percentage: 0,
    currentStep: '',
  })

  const [serialConfig, setSerialConfigState] = useState<SerialConfig>({
    baudRate: 115200,
    connected: false,
    port: null,
  })

  const addLog = useCallback((message: string, type: ConsoleLog['type'] = 'log') => {
    setLogs((prev) => [...prev, { id: MakeId(), message, type, timestamp: Date.now() }])
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  const addSerialLog = useCallback((message: string, type: ConsoleLog['type'] = 'log') => {
    setSerialLogs((prev) => [...prev, { id: MakeId(), message, type, timestamp: Date.now() }])
  }, [])

  const clearSerialLogs = useCallback(() => setSerialLogs([]), [])

  const addProblem = useCallback((problem: Omit<Problem, 'id'>) => {
    setProblems((prev) => [...prev, { ...problem, id: MakeId() }])
  }, [])

  const clearProblems = useCallback(() => setProblems([]), [])

  const setBuildProgress = useCallback((partial: Partial<BuildProgress>) => {
    setBuildProgressState((prev) => ({ ...prev, ...partial }))
  }, [])

  const setSerialConfig = useCallback((partial: Partial<SerialConfig>) => {
    setSerialConfigState((prev) => ({ ...prev, ...partial }))
  }, [])

  const value: ConsoleContextType = {
    logs, addLog, clearLogs,
    serialLogs, addSerialLog, clearSerialLogs, serialConfig, setSerialConfig,
    problems, addProblem, clearProblems,
    buildProgress, setBuildProgress,
    isCompiling, setIsCompiling,
    activeBottomTab, setActiveBottomTab,
  }

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
}

export function useConsole() {
  const context = useContext(ConsoleContext)
  if (!context) throw new Error('useConsole must be used within ConsoleProvider')
  return context
}
