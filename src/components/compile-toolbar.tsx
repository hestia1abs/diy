'use client'

import { useState, useCallback } from 'react'
import { Play, Upload, Save, Download, Settings, ChevronDown } from 'lucide-react'
import { useProject } from '@/lib/project-context'
import { useConsole } from '@/lib/console-context'
import { CompileFirmware } from '@/lib/Api'

export function CompileToolbar() {
  const { project, saveAll, getAllFiles } = useProject()
  const { addLog, clearLogs, clearProblems, addProblem, setBuildProgress, setIsCompiling, isCompiling, setActiveBottomTab } = useConsole()
  const [showBoardMenu, setShowBoardMenu] = useState(false)

  const boards = [
    { id: 'esp32', name: 'ESP32 Dev Module' },
    { id: 'esp8266', name: 'ESP8266 NodeMCU' },
    { id: 'esp32s3', name: 'ESP32-S3 DevKitC' },
  ]

  const selectedBoard = boards.find(b => b.id === project.boardType) || boards[0]

  const HandleCompile = useCallback(async () => {
    if (isCompiling) return
    setIsCompiling(true)
    clearLogs()
    clearProblems()
    setActiveBottomTab('output')
    setBuildProgress({ status: 'compiling', percentage: 0, currentStep: 'Preparing source...' })

    addLog('Starting compilation...', 'log')
    addLog(`Board: ${selectedBoard.name}`, 'log')

    try {
      // Collect all source files
      const allFiles = getAllFiles()
      const sourceFiles = allFiles.filter(f =>
        f.name.endsWith('.ino') || f.name.endsWith('.cpp') || f.name.endsWith('.c') || f.name.endsWith('.h')
      )

      if (sourceFiles.length === 0) {
        addLog('No source files found in project.', 'error')
        addProblem({ file: '', line: 0, column: 0, severity: 'error', message: 'No source files in project' })
        setBuildProgress({ status: 'error', percentage: 0, currentStep: 'No source files' })
        setIsCompiling(false)
        return
      }

      // Concatenate sources (main .ino first, then headers, then .cpp)
      const mainFile = sourceFiles.find(f => f.name.endsWith('.ino'))
      const headers = sourceFiles.filter(f => f.name.endsWith('.h') || f.name.endsWith('.hpp'))
      const cppFiles = sourceFiles.filter(f => (f.name.endsWith('.cpp') || f.name.endsWith('.c')) && !f.name.endsWith('.ino'))

      let combinedSource = ''
      for (const header of headers) {
        combinedSource += `// === ${header.name} ===\n${header.content}\n\n`
        addLog(`Including: ${header.name}`, 'log')
      }
      if (mainFile) {
        combinedSource += `// === ${mainFile.name} ===\n${mainFile.content}\n\n`
        addLog(`Main file: ${mainFile.name}`, 'log')
      }
      for (const cpp of cppFiles) {
        combinedSource += `// === ${cpp.name} ===\n${cpp.content}\n\n`
        addLog(`Including: ${cpp.name}`, 'log')
      }

      setBuildProgress({ percentage: 30, currentStep: 'Sending to build server...' })
      addLog('Sending to build server...', 'log')

      // Get auth token from localStorage or env
      const token = localStorage.getItem('hestia-auth-token') || ''

      const blob = await CompileFirmware(token, {
        source: combinedSource,
        board: project.boardType || 'esp32',
      })

      setBuildProgress({ status: 'success', percentage: 100, currentStep: 'Build complete!' })
      addLog(`Compilation successful! Binary size: ${(blob.size / 1024).toFixed(1)} KB`, 'success')

      // Auto-download the binary
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name.replace(/\s+/g, '_')}.bin`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      addLog('Binary downloaded.', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown compilation error'
      setBuildProgress({ status: 'error', percentage: 0, currentStep: 'Build failed' })
      addLog(`Compilation failed: ${message}`, 'error')
      addProblem({ file: 'build', line: 0, column: 0, severity: 'error', message })

      // Try to parse error for file/line info
      const lineMatch = message.match(/(\w+\.\w+):(\d+):(\d+):\s*(error|warning):\s*(.+)/)
      if (lineMatch) {
        addProblem({
          file: lineMatch[1],
          line: parseInt(lineMatch[2]),
          column: parseInt(lineMatch[3]),
          severity: lineMatch[4] as 'error' | 'warning',
          message: lineMatch[5],
        })
        setActiveBottomTab('problems')
      }
    } finally {
      setIsCompiling(false)
    }
  }, [isCompiling, project, selectedBoard, getAllFiles, addLog, clearLogs, clearProblems, addProblem, setBuildProgress, setIsCompiling, setActiveBottomTab])

  const HandleSave = useCallback(() => {
    saveAll()
    addLog('Project saved.', 'success')
  }, [saveAll, addLog])

  return (
    <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
      {/* Compile button */}
      <button
        onClick={() => void HandleCompile()}
        disabled={isCompiling}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all text-sm ${
          isCompiling
            ? 'bg-blue-700 text-white cursor-not-allowed opacity-75'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
        }`}
      >
        <Play size={14} className={isCompiling ? 'animate-pulse' : ''} />
        {isCompiling ? 'Compiling...' : 'Verify'}
      </button>

      {/* Upload button */}
      <button
        className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-sm"
        title="Upload to device (Web Serial)"
      >
        <Upload size={14} />
        Upload
      </button>

      <div className="w-px h-6 bg-slate-700" />

      {/* Save */}
      <button
        onClick={HandleSave}
        title="Save All (Ctrl+S)"
        className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Save size={16} />
      </button>

      {/* Export */}
      <button
        title="Export Compiled Binary"
        className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Download size={16} />
      </button>

      <div className="flex-1" />

      {/* Board Selector */}
      <div className="relative">
        <button
          onClick={() => setShowBoardMenu(!showBoardMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm transition-colors border border-slate-600"
        >
          <span className="text-slate-400 text-xs">Board:</span>
          <span>{selectedBoard.name}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        {showBoardMenu && (
          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 min-w-48">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => {
                  setShowBoardMenu(false)
                  // Board change would update project context
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
                  board.id === project.boardType ? 'text-blue-400' : 'text-slate-300'
                }`}
              >
                {board.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <button
        title="Compiler Settings"
        className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Settings size={16} />
      </button>
    </div>
  )
}
