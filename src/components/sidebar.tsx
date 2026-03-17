'use client'

import { FileText, Search, GitBranch, Bug, BookOpen, Cpu, Grid3x3, Settings } from 'lucide-react'

interface SidebarProps {
  activePanel: string
  onPanelChange: (panel: any) => void
}

export function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  const tools = [
    { id: 'explorer', icon: FileText, label: 'Explorer', tooltip: 'File Explorer' },
    { id: 'search', icon: Search, label: 'Search', tooltip: 'Search Files' },
    { id: 'source', icon: GitBranch, label: 'Source', tooltip: 'Source Control' },
    { id: 'debug', icon: Bug, label: 'Debug', tooltip: 'Debug Console' },
    { id: 'libraries', icon: BookOpen, label: 'Libraries', tooltip: 'Library Manager' },
    { id: 'boards', icon: Cpu, label: 'Boards', tooltip: 'Boards Manager' },
    { id: 'extensions', icon: Grid3x3, label: 'Extensions', tooltip: 'Extensions' },
  ]

  return (
    <div className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-3 gap-2">
      {tools.map((tool) => {
        const Icon = tool.icon
        const isActive = activePanel === tool.id
        return (
          <button
            key={tool.id}
            onClick={() => onPanelChange(tool.id)}
            title={tool.tooltip}
            className={`w-12 h-12 flex items-center justify-center rounded transition-colors relative group ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'
            }`}
          >
            <Icon size={24} />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {tool.tooltip}
            </div>
          </button>
        )
      })}

      {/* Bottom tools */}
      <div className="flex-1" />
      <button
        title="Settings"
        className="w-12 h-12 flex items-center justify-center rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors relative group"
      >
        <Settings size={24} />
        <div className="absolute left-full ml-2 bg-slate-900 text-slate-100 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Settings
        </div>
      </button>
    </div>
  )
}
