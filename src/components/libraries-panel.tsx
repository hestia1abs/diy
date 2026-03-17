'use client'

import { Search, Trash2, Download } from 'lucide-react'
import { useState } from 'react'

export function LibrariesPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  const libraries = [
    {
      id: 1,
      name: 'Arduino AVR Boards',
      author: 'Arduino',
      version: '1.8.7',
      status: 'installed',
      description: 'Boards included in this package: Arduino Leonardo, Arduino Leonardo ETH, Arduino Micro...',
    },
    {
      id: 2,
      name: 'Arduino ESP32 Boards',
      author: 'Arduino',
      version: '2.0.18',
      status: 'installed',
      description: 'Boards included in this package: Arduino Nano ESP32...',
    },
    {
      id: 3,
      name: 'Arduino Mbed OS Edge Boards',
      author: 'Arduino',
      version: '4.5.0',
      status: 'available',
      description: 'Boards included in this package: Arduino Edge Control...',
    },
  ]

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center px-4">
        <span className="text-sm font-semibold text-slate-200">LIBRARY MANAGER</span>
      </div>

      {/* Search */}
      <div className="border-b border-slate-700 p-3 space-y-3">
        <div className="flex items-center bg-slate-800 rounded px-2 py-1">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            placeholder="Filter your search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 ml-2 bg-transparent outline-none text-sm text-slate-200 placeholder-slate-500"
          />
        </div>

        <div className="flex gap-2">
          <select className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 hover:border-slate-600 transition-colors">
            <option>Type: All</option>
            <option>Type: Updatable</option>
            <option>Type: Installed</option>
          </select>
          <select className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 hover:border-slate-600 transition-colors">
            <option>Topic: All</option>
            <option>Topic: Audio</option>
            <option>Topic: Device</option>
          </select>
        </div>
      </div>

      {/* Libraries list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {libraries.map(lib => (
          <div key={lib.id} className="border border-slate-700 rounded p-3 bg-slate-800 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-100">{lib.name}</h3>
                <p className="text-xs text-slate-400 mt-1">by {lib.author}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{lib.description}</p>
              </div>
              <div className="text-xs text-slate-400 whitespace-nowrap">
                v{lib.version}
              </div>
            </div>

            {/* Action button */}
            <div className="mt-3 flex items-center gap-2">
              <select className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 hover:bg-slate-600 transition-colors">
                <option>{lib.version}</option>
                <option>1.8.6</option>
                <option>1.8.5</option>
              </select>

              {lib.status === 'installed' ? (
                <button className="ml-auto text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors flex items-center gap-1">
                  <Trash2 size={12} />
                  REMOVE
                </button>
              ) : (
                <button className="ml-auto text-xs px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors flex items-center gap-1">
                  <Download size={12} />
                  INSTALL
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
