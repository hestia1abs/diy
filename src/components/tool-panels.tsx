'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Trash2, Send, Plug, PlugZap, ChevronDown } from 'lucide-react'
import { useConsole } from '@/lib/console-context'
import { useProject } from '@/lib/project-context'

export function ToolPanels({ activePanel }: { activePanel: string; style?: React.CSSProperties }) {
  const {
    logs, clearLogs,
    serialLogs, addSerialLog, clearSerialLogs,
    problems, clearProblems,
    serialConfig, setSerialConfig,
    activeBottomTab, setActiveBottomTab,
    buildProgress,
  } = useConsole()
  const { openFile } = useProject()

  const [serialInput, setSerialInput] = useState('')
  const [panelHeight, setPanelHeight] = useState(224)
  const [isResizing, setIsResizing] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)
  const serialRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (activeBottomTab === 'output' && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [logs, activeBottomTab])

  useEffect(() => {
    if (activeBottomTab === 'serial' && serialRef.current) {
      serialRef.current.scrollTop = serialRef.current.scrollHeight
    }
  }, [serialLogs, activeBottomTab])

  // Resize handling
  const HandleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startY = e.clientY
    const startHeight = panelHeight

    const HandleMouseMove = (e: MouseEvent) => {
      const delta = startY - e.clientY
      setPanelHeight(Math.max(100, Math.min(600, startHeight + delta)))
    }

    const HandleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', HandleMouseMove)
      document.removeEventListener('mouseup', HandleMouseUp)
    }

    document.addEventListener('mousemove', HandleMouseMove)
    document.addEventListener('mouseup', HandleMouseUp)
  }, [panelHeight])

  const HandleSerialSend = useCallback(() => {
    if (serialInput.trim()) {
      addSerialLog(`> ${serialInput}`, 'log')
      setSerialInput('')
    }
  }, [serialInput, addSerialLog])

  const HandleProblemClick = useCallback((problem: { file: string; line: number }) => {
    if (problem.file) {
      openFile(problem.file)
    }
  }, [openFile])

  const FormatTimestamp = (ts: number) => {
    const d = new Date(ts)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  }

  const errorCount = problems.filter(p => p.severity === 'error').length
  const warningCount = problems.filter(p => p.severity === 'warning').length

  return (
    <div
      className="border-t border-slate-700 bg-slate-950 flex flex-col overflow-hidden"
      style={{ height: panelHeight }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={HandleResizeStart}
        className={`h-1 cursor-ns-resize hover:bg-blue-500/50 transition-colors ${isResizing ? 'bg-blue-500/50' : ''}`}
      />

      {/* Tab header */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-1 shrink-0">
        <button
          onClick={() => setActiveBottomTab('output')}
          className={`text-xs font-medium py-2 px-3 rounded transition-colors ${
            activeBottomTab === 'output'
              ? 'text-slate-100 bg-slate-700'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Output
          {buildProgress.status === 'compiling' && (
            <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveBottomTab('serial')}
          className={`text-xs font-medium py-2 px-3 rounded transition-colors flex items-center gap-1.5 ${
            activeBottomTab === 'serial'
              ? 'text-slate-100 bg-slate-700'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Serial Monitor
          {serialConfig.connected && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          )}
        </button>
        <button
          onClick={() => setActiveBottomTab('problems')}
          className={`text-xs font-medium py-2 px-3 rounded transition-colors flex items-center gap-1.5 ${
            activeBottomTab === 'problems'
              ? 'text-slate-100 bg-slate-700'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Problems
          {(errorCount > 0 || warningCount > 0) && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              errorCount > 0 ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
            }`}>
              {errorCount + warningCount}
            </span>
          )}
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {activeBottomTab === 'serial' && (
            <>
              {/* Baud rate */}
              <div className="relative">
                <select
                  value={serialConfig.baudRate}
                  onChange={(e) => setSerialConfig({ baudRate: parseInt(e.target.value) })}
                  className="bg-slate-700 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-600 appearance-none pr-5"
                >
                  <option value={9600}>9600</option>
                  <option value={19200}>19200</option>
                  <option value={38400}>38400</option>
                  <option value={57600}>57600</option>
                  <option value={115200}>115200</option>
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Connect/Disconnect */}
              <button
                onClick={() => setSerialConfig({ connected: !serialConfig.connected })}
                className={`p-1 rounded transition-colors ${
                  serialConfig.connected
                    ? 'text-green-400 hover:text-green-300 hover:bg-slate-700'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
                }`}
                title={serialConfig.connected ? 'Disconnect' : 'Connect'}
              >
                {serialConfig.connected ? <PlugZap size={14} /> : <Plug size={14} />}
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (activeBottomTab === 'output') clearLogs()
              else if (activeBottomTab === 'serial') clearSerialLogs()
              else clearProblems()
            }}
            title="Clear"
            className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded hover:bg-slate-700"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Output tab */}
        {activeBottomTab === 'output' && (
          <div ref={outputRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 leading-relaxed">
                <span className="text-slate-600 shrink-0 select-none">{FormatTimestamp(log.timestamp)}</span>
                <span className={`flex-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-slate-400'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
            {buildProgress.status === 'compiling' && (
              <div className="flex items-center gap-2 text-blue-400 mt-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>{buildProgress.currentStep}</span>
              </div>
            )}
            {logs.length === 0 && (
              <div className="text-slate-600 py-4 text-center">No output yet.</div>
            )}
          </div>
        )}

        {/* Serial Monitor tab */}
        {activeBottomTab === 'serial' && (
          <>
            <div ref={serialRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
              {serialLogs.length === 0 ? (
                <div className="text-slate-600 py-4 text-center">
                  {serialConfig.connected
                    ? 'Waiting for data...'
                    : 'Not connected. Select a port and click Connect.'}
                </div>
              ) : (
                serialLogs.map((log) => (
                  <div key={log.id} className="flex gap-2 leading-relaxed">
                    <span className="text-slate-600 shrink-0 select-none">{FormatTimestamp(log.timestamp)}</span>
                    <span className="flex-1 text-cyan-400">{log.message}</span>
                  </div>
                ))
              )}
            </div>
            {/* Serial input */}
            <div className="h-8 border-t border-slate-700 flex items-center px-3 gap-2 shrink-0">
              <input
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') HandleSerialSend() }}
                placeholder={serialConfig.connected ? 'Type to send...' : 'Connect first...'}
                disabled={!serialConfig.connected}
                className="flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder-slate-600 disabled:opacity-50"
              />
              <button
                onClick={HandleSerialSend}
                disabled={!serialConfig.connected || !serialInput.trim()}
                className="text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
              >
                <Send size={12} />
              </button>
            </div>
          </>
        )}

        {/* Problems tab */}
        {activeBottomTab === 'problems' && (
          <div className="flex-1 overflow-y-auto p-3">
            {problems.length === 0 ? (
              <div className="text-slate-600 py-4 text-center text-xs">No problems detected.</div>
            ) : (
              <div className="space-y-1">
                {problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => HandleProblemClick(problem)}
                    className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors text-xs"
                  >
                    <span className={`shrink-0 mt-0.5 ${
                      problem.severity === 'error' ? 'text-red-400' :
                      problem.severity === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {problem.severity === 'error' ? '✕' : problem.severity === 'warning' ? '⚠' : 'ℹ'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-300">{problem.message}</span>
                      {problem.file && (
                        <span className="text-slate-500 ml-2">
                          {problem.file}{problem.line > 0 ? `:${problem.line}` : ''}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
