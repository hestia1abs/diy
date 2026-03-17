'use client'

import { useState } from 'react'
import { ChevronUp, X, Trash2 } from 'lucide-react'

interface ToolPanelsProps {
  activePanel: string
  style?: React.CSSProperties
}

export function ToolPanels({ activePanel, style }: ToolPanelsProps) {
  const [tab, setTab] = useState<'output' | 'serial' | 'problems'>('output')
  const [consoleLogs, setConsoleLogs] = useState([
    { time: '09:39:25', type: 'info', message: 'Hestia Cloud Editor — Ready' },
    { time: '09:39:25', type: 'info', message: 'Select a board and click Compile to build your firmware.' },
  ])
  const [serialLogs, setSerialLogs] = useState([
    { time: '09:40:12', type: 'serial', message: 'Device connected on /dev/ttyUSB0' },
    { time: '09:40:13', type: 'serial', message: '[HXTP] State changed to: PROVISIONING' },
    { time: '09:40:15', type: 'serial', message: '[HXTP] HxTP connected and authenticated' },
  ])

  const [expanded, setExpanded] = useState(true)

  return (
    <div className="h-56 border-t border-slate-700 bg-slate-950 flex flex-col overflow-hidden">
      {/* Tab header */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
        <button
          onClick={() => setTab('output')}
          className={`text-sm py-2 px-3 rounded-t transition-colors ${
            tab === 'output'
              ? 'text-slate-100 bg-slate-700'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setTab('serial')}
          className={`text-sm py-2 px-3 rounded-t transition-colors ${
            tab === 'serial'
              ? 'text-slate-100 bg-slate-700'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Serial Monitor
        </button>
        <button
          onClick={() => setTab('problems')}
          className={`text-sm py-2 px-3 rounded-t transition-colors ${
            tab === 'problems'
              ? 'text-slate-100 bg-slate-700'
              : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          Problems
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setConsoleLogs([])}
            title="Clear"
            className="text-slate-400 hover:text-slate-100 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Console content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {tab === 'output' && (
          <>
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-slate-600 flex-shrink-0">{log.time}</span>
                <span className={`flex-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warn' ? 'text-yellow-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-slate-400'
                }`}>
                  [INFO] {log.message}
                </span>
              </div>
            ))}
            <div className="text-slate-600">
              Not connected. Select a board and a port to connect automatically.
            </div>
          </>
        )}

        {tab === 'serial' && (
          <>
            {serialLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 text-slate-300">
                <span className="text-slate-600 flex-shrink-0">{log.time}</span>
                <span className="flex-1 text-cyan-400">{log.message}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'problems' && (
          <div className="text-slate-500 py-4">
            No problems detected.
          </div>
        )}
      </div>
    </div>
  )
}
