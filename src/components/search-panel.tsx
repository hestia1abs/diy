'use client'

import { Search, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function SearchPanel() {
  const [query, setQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [showReplace, setShowReplace] = useState(false)

  const results = [
    { file: 'BlueLED.ino', line: 15, text: '// Copy these values from the Hestia Labs Cloud Console' },
    { file: 'BlueLED.ino', line: 25, text: 'void onHxtpStateChange(hxtp::HxtpClientState oldState,' },
    { file: 'config.h', line: 8, text: '#define API_BASE_URL "https://cloud.hestialabs.in/api/v1"' },
  ]

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center px-4">
        <span className="text-sm font-semibold text-slate-200">SEARCH</span>
      </div>

      {/* Search box */}
      <div className="border-b border-slate-700 p-3 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-slate-800 rounded px-2 py-2">
            <Search size={16} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 ml-2 bg-transparent outline-none text-sm text-slate-200 placeholder-slate-500"
            />
          </div>
          <button className="px-2 py-2 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-100">
            <ChevronRight size={16} />
          </button>
        </div>

        {showReplace && (
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-slate-800 rounded px-2 py-2">
              <input
                type="text"
                placeholder="Replace"
                value={replaceQuery}
                onChange={e => setReplaceQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder-slate-500"
              />
            </div>
          </div>
        )}

        <div className="flex gap-1 text-xs">
          <button className="px-2 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors" title="Match Case">
            Ab
          </button>
          <button className="px-2 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors" title="Match Whole Word">
            [ab]
          </button>
          <button className="px-2 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors" title="Use Regular Expression">
            .*
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="px-2 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors"
            title="Toggle Replace"
          >
            Replace
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="text-xs text-slate-500 px-2 py-2">
          {results.length} results in 2 files
        </div>
        
        {results.map((result, idx) => (
          <button
            key={idx}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded transition-colors text-sm text-slate-400 hover:text-slate-100"
          >
            <div className="font-semibold text-slate-300">{result.file}</div>
            <div className="text-xs text-slate-500 mt-1">Line {result.line}</div>
            <div className="text-xs text-slate-400 mt-1 truncate">{result.text}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
