'use client'

import {
  FolderOpen, Search, Bug, BookOpen, Cpu, GitBranch, Settings, AlertCircle
} from 'lucide-react'
import { useConsole } from '@/lib/console-context'

const PANEL_ITEMS = [
  { id: 'explorer', icon: FolderOpen, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'debug', icon: Bug, label: 'Debug' },
  { id: 'libraries', icon: BookOpen, label: 'Libraries' },
  { id: 'boards', icon: Cpu, label: 'Boards' },
  { id: 'source', icon: GitBranch, label: 'Source Control' },
] as const

export type PanelId = (typeof PANEL_ITEMS)[number]['id']

interface SidebarProps {
  activePanel: PanelId | string
  onPanelChange: (panel: PanelId | string) => void
}

export function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  const { problems } = useConsole()
  const errorCount = problems.filter(p => p.severity === 'error').length

  return (
    <div className="w-12 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-2 gap-1">
      {/* Top panel buttons */}
      <div className="flex flex-col gap-0.5">
        {PANEL_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activePanel === id
          return (
            <button
              key={id}
              onClick={() => onPanelChange(isActive ? '' : id)}
              title={label}
              className={`relative w-10 h-10 flex items-center justify-center rounded transition-colors ${
                isActive
                  ? 'text-white bg-slate-700'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r" />
              )}
              <Icon size={18} />
              {/* Badge for debug when errors exist */}
              {id === 'debug' && errorCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-[8px] font-bold rounded-full flex items-center justify-center text-white">
                  {errorCount > 9 ? '9+' : errorCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      {/* Bottom settings */}
      <button
        title="Settings"
        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-200 rounded hover:bg-slate-800"
      >
        <Settings size={18} />
      </button>
    </div>
  )
}
