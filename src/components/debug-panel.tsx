'use client'

import { Bug, ChevronRight, Play, Pause, StepForward, StepBack, Square } from 'lucide-react'
import { useConsole } from '@/lib/console-context'

export function DebugPanel() {
  const { problems } = useConsole()

  const errors = problems.filter(p => p.severity === 'error')
  const warnings = problems.filter(p => p.severity === 'warning')

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      <div className="h-12 border-b border-slate-700 flex items-center px-4">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">DEBUG</span>
      </div>

      {/* Debug toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-700">
        <button className="p-1.5 rounded hover:bg-slate-800 text-green-400 transition-colors" title="Start Debug"><Play size={14} /></button>
        <button className="p-1.5 rounded hover:bg-slate-800 text-slate-500 transition-colors" title="Pause"><Pause size={14} /></button>
        <button className="p-1.5 rounded hover:bg-slate-800 text-slate-500 transition-colors" title="Step Over"><StepForward size={14} /></button>
        <button className="p-1.5 rounded hover:bg-slate-800 text-slate-500 transition-colors" title="Step Into"><StepBack size={14} /></button>
        <button className="p-1.5 rounded hover:bg-slate-800 text-red-400 transition-colors" title="Stop"><Square size={14} /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Errors section */}
        <div className="border-b border-slate-800">
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400">
            <ChevronRight size={12} className="rotate-90" />
            <span className="font-semibold">ERRORS</span>
            <span className="text-red-400">({errors.length})</span>
          </div>
          {errors.length === 0 ? (
            <p className="text-[10px] text-slate-600 px-8 pb-3">No errors</p>
          ) : (
            errors.map((err) => (
              <div key={err.id} className="px-8 py-1 text-xs text-red-400 hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-1">
                  <Bug size={10} />
                  <span className="truncate">{err.message}</span>
                </div>
                {err.file && <span className="text-slate-600 text-[10px] ml-3.5">{err.file}:{err.line}</span>}
              </div>
            ))
          )}
        </div>

        {/* Warnings section */}
        <div className="border-b border-slate-800">
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400">
            <ChevronRight size={12} className="rotate-90" />
            <span className="font-semibold">WARNINGS</span>
            <span className="text-yellow-400">({warnings.length})</span>
          </div>
          {warnings.length === 0 ? (
            <p className="text-[10px] text-slate-600 px-8 pb-3">No warnings</p>
          ) : (
            warnings.map((warn) => (
              <div key={warn.id} className="px-8 py-1 text-xs text-yellow-400 hover:bg-slate-800 cursor-pointer">
                <span className="truncate">{warn.message}</span>
                {warn.file && <span className="text-slate-600 text-[10px] ml-2">{warn.file}:{warn.line}</span>}
              </div>
            ))
          )}
        </div>

        {/* Breakpoints section */}
        <div>
          <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400">
            <ChevronRight size={12} className="rotate-90" />
            <span className="font-semibold">BREAKPOINTS</span>
          </div>
          <p className="text-[10px] text-slate-600 px-8 pb-3">
            Breakpoints are not yet available in browser-based debugging.
          </p>
        </div>

        {/* Info */}
        <div className="px-4 py-6 text-center">
          <p className="text-[10px] text-slate-600">
            Debug features require a connected device with debugging support.
          </p>
        </div>
      </div>
    </div>
  )
}
