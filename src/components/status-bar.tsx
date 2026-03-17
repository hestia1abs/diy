'use client'

import { Wifi, WifiOff, AlertCircle, CheckCircle, CircleDashed } from 'lucide-react'
import { useProject } from '@/lib/project-context'
import { useConsole } from '@/lib/console-context'

export function StatusBar() {
  const { project, cursorPosition, dirtyFiles } = useProject()
  const { buildProgress, serialConfig, problems } = useConsole()

  const errorCount = problems.filter(p => p.severity === 'error').length
  const warningCount = problems.filter(p => p.severity === 'warning').length

  const StatusIcon = () => {
    switch (buildProgress.status) {
      case 'compiling':
        return <CircleDashed size={12} className="animate-spin text-blue-400" />
      case 'success':
        return <CheckCircle size={12} className="text-green-400" />
      case 'error':
        return <AlertCircle size={12} className="text-red-400" />
      default:
        return <CheckCircle size={12} className="text-slate-500" />
    }
  }

  return (
    <div className="h-6 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-[10px] text-slate-400 select-none">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Build status */}
        <div className="flex items-center gap-1">
          <StatusIcon />
          <span>
            {buildProgress.status === 'compiling' ? buildProgress.currentStep :
             buildProgress.status === 'success' ? 'Build succeeded' :
             buildProgress.status === 'error' ? 'Build failed' :
             'Ready'}
          </span>
        </div>

        {/* Errors/Warnings */}
        {(errorCount > 0 || warningCount > 0) && (
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="flex items-center gap-0.5 text-red-400">
                <AlertCircle size={10} /> {errorCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-0.5 text-yellow-400">
                <AlertCircle size={10} /> {warningCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Dirty indicator */}
        {dirtyFiles.size > 0 && (
          <span className="text-amber-400">{dirtyFiles.size} unsaved</span>
        )}

        {/* Board */}
        <span className="text-slate-300">{project.boardType || 'esp32'}</span>

        {/* Serial connection */}
        <div className="flex items-center gap-1">
          {serialConfig.connected ? (
            <>
              <Wifi size={10} className="text-green-400" />
              <span className="text-green-400">{serialConfig.baudRate}</span>
            </>
          ) : (
            <>
              <WifiOff size={10} />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* Cursor position */}
        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>

        {/* Language */}
        {project.selectedFile && (
          <span className="text-slate-500">
            {project.selectedFile.split('.').pop()?.toUpperCase() || 'TXT'}
          </span>
        )}
      </div>
    </div>
  )
}
