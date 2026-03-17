'use client'

import { Search, Cpu } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useProject } from '@/lib/project-context'

interface Board {
  id: string
  name: string
  platform: string
  architecture: string
}

const BOARD_CATALOG: Board[] = [
  { id: 'esp32', name: 'ESP32 Dev Module', platform: 'Espressif', architecture: 'esp32' },
  { id: 'esp32s3', name: 'ESP32-S3 DevKitC-1', platform: 'Espressif', architecture: 'esp32s3' },
  { id: 'esp32c3', name: 'ESP32-C3 DevKitM-1', platform: 'Espressif', architecture: 'esp32c3' },
  { id: 'esp8266', name: 'NodeMCU 1.0 (ESP-12E)', platform: 'ESP8266', architecture: 'esp8266' },
  { id: 'wroom32', name: 'ESP32-WROOM-32', platform: 'Espressif', architecture: 'esp32' },
  { id: 'lolin32', name: 'WEMOS LOLIN32', platform: 'Espressif', architecture: 'esp32' },
  { id: 'ttgo', name: 'TTGO T-Display', platform: 'Espressif', architecture: 'esp32' },
]

export function BoardsPanel() {
  const { project, setProject } = useProject()
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return BOARD_CATALOG
    const q = searchQuery.toLowerCase()
    return BOARD_CATALOG.filter(b => b.name.toLowerCase().includes(q) || b.platform.toLowerCase().includes(q))
  }, [searchQuery])

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      <div className="h-12 border-b border-slate-700 flex items-center px-4">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">BOARDS MANAGER</span>
      </div>

      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center bg-slate-800 rounded px-2 py-1.5 border border-slate-700">
          <Search size={14} className="text-slate-500" />
          <input
            placeholder="Filter boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-2 bg-transparent outline-none text-xs text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((board) => {
          const isSelected = project.boardType === board.id
          return (
            <button
              key={board.id}
              onClick={() => setProject({ ...project, boardType: board.id })}
              className={`w-full text-left px-4 py-3 border-b border-slate-800 transition-colors flex items-start gap-3 ${
                isSelected ? 'bg-blue-600/10' : 'hover:bg-slate-800/50'
              }`}
            >
              <Cpu size={16} className={`mt-0.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                    {board.name}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">SELECTED</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{board.platform} · {board.architecture}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
