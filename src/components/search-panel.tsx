'use client'

import { Search, X, ArrowDown, ArrowUp, Replace } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { useProject } from '@/lib/project-context'

interface SearchResult {
  fileId: string
  fileName: string
  line: number
  column: number
  text: string
  matchStart: number
  matchEnd: number
}

export function SearchPanel() {
  const { project, getAllFiles, openFile, updateFile } = useProject()
  const [query, setQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []

    const allFiles = getAllFiles()
    const matches: SearchResult[] = []

    for (const file of allFiles) {
      const lines = file.content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let searchLine = line
        let searchQuery = query

        if (!caseSensitive) {
          searchLine = line.toLowerCase()
          searchQuery = query.toLowerCase()
        }

        let idx = 0
        while (idx < searchLine.length) {
          let matchIdx: number

          if (useRegex) {
            try {
              const regex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')
              regex.lastIndex = idx
              const match = regex.exec(searchLine)
              if (!match) break
              matchIdx = match.index
            } catch {
              break
            }
          } else {
            matchIdx = searchLine.indexOf(searchQuery, idx)
          }

          if (matchIdx === -1) break

          if (wholeWord) {
            const before = matchIdx > 0 ? searchLine[matchIdx - 1] : ' '
            const after = matchIdx + searchQuery.length < searchLine.length ? searchLine[matchIdx + searchQuery.length] : ' '
            if (/\w/.test(before) || /\w/.test(after)) {
              idx = matchIdx + 1
              continue
            }
          }

          matches.push({
            fileId: file.id,
            fileName: file.name,
            line: i + 1,
            column: matchIdx + 1,
            text: line.trim(),
            matchStart: matchIdx,
            matchEnd: matchIdx + searchQuery.length,
          })

          idx = matchIdx + searchQuery.length
          if (matches.length > 200) break
        }

        if (matches.length > 200) break
      }
      if (matches.length > 200) break
    }

    return matches
  }, [query, caseSensitive, wholeWord, useRegex, getAllFiles])

  const HandleResultClick = useCallback((result: SearchResult) => {
    openFile(result.fileId)
  }, [openFile])

  const HandleReplaceAll = useCallback(() => {
    if (!query.trim() || !replaceQuery) return
    const allFiles = getAllFiles()
    for (const file of allFiles) {
      let newContent: string
      if (useRegex) {
        try {
          const regex = new RegExp(query, caseSensitive ? 'g' : 'gi')
          newContent = file.content.replace(regex, replaceQuery)
        } catch { continue }
      } else if (caseSensitive) {
        newContent = file.content.split(query).join(replaceQuery)
      } else {
        newContent = file.content.replace(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replaceQuery)
      }
      if (newContent !== file.content) {
        updateFile(file.id, newContent)
      }
    }
  }, [query, replaceQuery, caseSensitive, useRegex, getAllFiles, updateFile])

  // Group results by file
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const result of results) {
      if (!groups[result.fileId]) groups[result.fileId] = []
      groups[result.fileId].push(result)
    }
    return groups
  }, [results])

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center px-4">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">SEARCH</span>
      </div>

      {/* Search inputs */}
      <div className="border-b border-slate-700 p-3 space-y-2">
        <div className="flex items-center bg-slate-800 rounded px-2 py-1.5 border border-slate-700 focus-within:border-blue-500 transition-colors">
          <Search size={14} className="text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 ml-2 bg-transparent outline-none text-xs text-slate-200 placeholder-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <X size={12} />
            </button>
          )}
        </div>

        {showReplace && (
          <div className="flex items-center bg-slate-800 rounded px-2 py-1.5 border border-slate-700 focus-within:border-blue-500 transition-colors">
            <Replace size={14} className="text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Replace"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="flex-1 ml-2 bg-transparent outline-none text-xs text-slate-200 placeholder-slate-500"
            />
          </div>
        )}

        {/* Options */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              caseSensitive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Match Case"
          >Aa</button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              wholeWord ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Whole Word"
          >ab</button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
              useRegex ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
            title="Regex"
          >.*</button>
          <div className="flex-1" />
          <button
            onClick={() => setShowReplace(!showReplace)}
            className={`px-2 py-0.5 rounded transition-colors ${
              showReplace ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'
            }`}
          >Replace</button>
          {showReplace && replaceQuery && results.length > 0 && (
            <button
              onClick={HandleReplaceAll}
              className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] hover:bg-blue-500"
            >All</button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {query.trim() && (
          <div className="text-[10px] text-slate-500 px-4 py-2 border-b border-slate-800">
            {results.length} result{results.length !== 1 ? 's' : ''} in {Object.keys(groupedResults).length} file{Object.keys(groupedResults).length !== 1 ? 's' : ''}
            {results.length >= 200 && ' (limited)'}
          </div>
        )}

        {Object.entries(groupedResults).map(([fileId, fileResults]) => (
          <div key={fileId}>
            <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-300 bg-slate-800/50 sticky top-0">
              {fileResults[0].fileName}
              <span className="text-slate-500 ml-1">({fileResults.length})</span>
            </div>
            {fileResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => HandleResultClick(result)}
                className="w-full text-left px-4 py-1 hover:bg-slate-800 transition-colors text-xs text-slate-400 hover:text-slate-200 flex items-baseline gap-2"
              >
                <span className="text-slate-600 shrink-0 w-6 text-right font-mono">{result.line}</span>
                <span className="truncate">{result.text}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
