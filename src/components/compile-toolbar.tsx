'use client'

import { useState } from 'react'
import { Play, Upload, RotateCcw, Download, Settings } from 'lucide-react'

export function CompileToolbar() {
  const [isCompiling, setIsCompiling] = useState(false)

  const handleCompile = () => {
    setIsCompiling(true)
    setTimeout(() => setIsCompiling(false), 2000)
  }

  return (
    <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3">
      {/* Compile button */}
      <button
        onClick={handleCompile}
        disabled={isCompiling}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
          isCompiling
            ? 'bg-blue-700 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Play size={16} />
        {isCompiling ? 'Compiling...' : 'Compile'}
      </button>

      {/* Upload button */}
      <button className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors">
        <Upload size={16} />
        Upload
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Action buttons */}
      <button
        title="Save All"
        className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <RotateCcw size={18} />
      </button>

      <button
        title="Export Compiled Binary"
        className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Download size={18} />
      </button>

      <div className="flex-1" />

      {/* Settings button */}
      <button
        title="Compiler Settings"
        className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Settings size={18} />
      </button>
    </div>
  )
}
