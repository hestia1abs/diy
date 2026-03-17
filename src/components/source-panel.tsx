'use client'

import { ChevronRight, GitBranch, Check, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export function SourcePanel() {
  const [stagedExpanded, setStagedExpanded] = useState(true)
  const [unstagedExpanded, setUnstagedExpanded] = useState(true)

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4">
        <span className="text-sm font-semibold text-slate-200">SOURCE CONTROL</span>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Commit
          </button>
        </div>
      </div>

      {/* Commit message */}
      <div className="border-b border-slate-700 p-3">
        <textarea
          placeholder="Message (Ctrl+Enter to commit)"
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-600 transition-colors resize-none h-16"
        />
      </div>

      {/* Changes */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Staged changes */}
        <div>
          <button
            onClick={() => setStagedExpanded(!stagedExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded transition-colors text-sm text-slate-300 font-medium"
          >
            <ChevronRight
              size={16}
              className={`transition-transform ${stagedExpanded ? 'rotate-90' : ''}`}
            />
            <GitBranch size={14} />
            CHANGES (2)
          </button>

          {stagedExpanded && (
            <div className="space-y-1 pl-4">
              <button className="w-full text-left flex items-center gap-2 px-3 py-1 hover:bg-slate-800 rounded transition-colors text-xs text-slate-400 hover:text-slate-200">
                <Check size={12} className="text-green-500" />
                BlueLED.ino
              </button>
              <button className="w-full text-left flex items-center gap-2 px-3 py-1 hover:bg-slate-800 rounded transition-colors text-xs text-slate-400 hover:text-slate-200">
                <Check size={12} className="text-green-500" />
                config.h
              </button>
            </div>
          )}
        </div>

        {/* Untracked files */}
        <div>
          <button
            onClick={() => setUnstagedExpanded(!unstagedExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded transition-colors text-sm text-slate-300 font-medium"
          >
            <ChevronRight
              size={16}
              className={`transition-transform ${unstagedExpanded ? 'rotate-90' : ''}`}
            />
            <GitBranch size={14} />
            UNTRACKED (1)
          </button>

          {unstagedExpanded && (
            <div className="space-y-1 pl-4">
              <button className="w-full text-left flex items-center gap-2 px-3 py-1 hover:bg-slate-800 rounded transition-colors text-xs text-slate-400 hover:text-slate-200">
                <AlertCircle size={12} className="text-yellow-500" />
                temp.txt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
