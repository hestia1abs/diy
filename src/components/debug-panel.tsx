'use client'

import { ChevronRight, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export function DebugPanel() {
  const [debugRunning, setDebugRunning] = useState(false)

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4">
        <span className="text-sm font-semibold text-slate-200">DEBUG</span>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-green-400 transition-colors" title="Start Debugging">
            <Play size={16} />
          </button>
          <button className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors" title="Restart">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Variables */}
        <div className="border border-slate-700 rounded">
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-sm text-slate-300 font-medium">
            <ChevronRight size={16} />
            VARIABLES
          </button>
        </div>

        {/* Call Stack */}
        <div className="border border-slate-700 rounded">
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-sm text-slate-300 font-medium">
            <ChevronRight size={16} className="rotate-90" />
            CALL STACK
          </button>
          <div className="border-t border-slate-700 text-xs text-slate-400 space-y-1 p-2">
            <div className="pl-4 py-1">onHxtpStateChange (BlueLED.ino:26)</div>
            <div className="pl-4 py-1">{'hxtpClient->poll() (BlueLED.ino:45)'}</div>
            <div className="pl-4 py-1">loop (BlueLED.ino:50)</div>
          </div>
        </div>

        {/* Breakpoints */}
        <div className="border border-slate-700 rounded">
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-sm text-slate-300 font-medium">
            <ChevronRight size={16} className="rotate-90" />
            BREAKPOINTS
          </button>
          <div className="border-t border-slate-700 text-xs text-slate-400 space-y-1 p-2">
            <div className="flex items-center gap-2 pl-4 py-1">
              <input type="checkbox" className="rounded" defaultChecked />
              BlueLED.ino:26
            </div>
            <div className="flex items-center gap-2 pl-4 py-1">
              <input type="checkbox" className="rounded" defaultChecked />
              BlueLED.ino:50
            </div>
          </div>
        </div>

        {/* Watch */}
        <div className="border border-slate-700 rounded">
          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 transition-colors text-sm text-slate-300 font-medium">
            <ChevronRight size={16} />
            WATCH
          </button>
        </div>
      </div>
    </div>
  )
}
