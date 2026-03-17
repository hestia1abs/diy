'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

export function StatusBar() {
  const [board, setBoard] = useState('ESP32 Dev Module')
  const [port, setPort] = useState('/dev/ttyUSB0')
  const [connected, setConnected] = useState(false)
  const [line, setLine] = useState(29)
  const [column, setColumn] = useState(2)

  return (
    <div className="h-7 bg-slate-800 border-t border-slate-700 flex items-center px-3 text-xs text-slate-300 gap-6">
      {/* Connection status */}
      <div className="flex items-center gap-2 cursor-pointer hover:text-slate-100 transition-colors">
        {connected ? (
          <CheckCircle size={13} className="text-green-500" />
        ) : (
          <AlertCircle size={13} className="text-yellow-600" />
        )}
        <span className={connected ? 'text-green-400' : 'text-slate-400'}>
          {connected ? 'Connected' : '[not connected]'}
        </span>
      </div>

      {/* Board info */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded transition-colors">
        <span className="text-slate-400">Board:</span>
        <span className="text-slate-200">{board}</span>
      </div>

      {/* Port info */}
      <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-700 px-2 py-1 rounded transition-colors">
        <span className="text-slate-400">Port:</span>
        <span className="text-slate-200">{port}</span>
      </div>

      <div className="flex-1" />

      {/* Line and column */}
      <div className="flex items-center gap-4">
        <span className="cursor-pointer hover:bg-slate-700 px-2 py-1 rounded transition-colors">
          Ln <span className="text-slate-200 font-mono">{line}</span>, Col <span className="text-slate-200 font-mono">{column}</span>
        </span>
      </div>
    </div>
  )
}
