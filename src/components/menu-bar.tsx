'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const menus = {
    file: [
      { label: 'New Sketch', shortcut: 'Ctrl+N' },
      { label: 'Open...', shortcut: 'Ctrl+O' },
      { label: 'Open Recent', submenu: true },
      { label: 'Sketchbook', submenu: true },
      { divider: true },
      { label: 'Save', shortcut: 'Ctrl+S' },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
      { label: 'Close', shortcut: 'Ctrl+W' },
      { divider: true },
      { label: 'Preferences...', shortcut: 'Ctrl+Comma' },
      { divider: true },
      { label: 'Exit', shortcut: 'Ctrl+Q' },
    ],
    edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', shortcut: 'Ctrl+Y' },
      { divider: true },
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', shortcut: 'Ctrl+V' },
      { divider: true },
      { label: 'Select All', shortcut: 'Ctrl+A' },
      { label: 'Find', shortcut: 'Ctrl+F' },
      { label: 'Find Next', shortcut: 'Ctrl+G' },
      { label: 'Replace', shortcut: 'Ctrl+H' },
    ],
    sketch: [
      { label: 'Verify/Compile', shortcut: 'Ctrl+R' },
      { label: 'Upload', shortcut: 'Ctrl+U' },
      { label: 'Upload Using Programmer', shortcut: 'Ctrl+Shift+U' },
      { divider: true },
      { label: 'Include Library', submenu: true },
      { label: 'Manage Libraries...', shortcut: 'Ctrl+Shift+I' },
      { divider: true },
      { label: 'Show Sketch Folder', shortcut: 'Ctrl+K' },
      { label: 'Add File...', submenu: true },
    ],
    tools: [
      { label: 'Serial Monitor', shortcut: 'Ctrl+Shift+M' },
      { label: 'Serial Plotter', shortcut: 'Ctrl+Shift+P' },
      { divider: true },
      { label: 'Board', submenu: true },
      { label: 'Port', submenu: true },
      { divider: true },
      { label: 'Programmer', submenu: true },
      { label: 'Burn Bootloader', submenu: true },
    ],
    help: [
      { label: 'Getting Started' },
      { label: 'Reference' },
      { label: 'Find in Reference', shortcut: 'Ctrl+Shift+F' },
      { divider: true },
      { label: 'Troubleshooting' },
      { label: 'FAQ' },
      { divider: true },
      { label: 'Visit Arduino.cc' },
      { label: 'About Arduino' },
    ],
  }

  return (
    <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-3 text-sm">
      <div className="flex gap-6">
        {Object.entries(menus).map(([key, items]) => (
          <div key={key} className="relative group">
            <button
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
              className="py-2 px-1 hover:bg-slate-700 rounded transition-colors capitalize flex items-center gap-1"
            >
              {key}
              <ChevronDown size={14} className="opacity-50" />
            </button>
            
            {openMenu === key && (
              <div className="absolute top-full left-0 bg-slate-800 border border-slate-700 rounded shadow-lg z-50 mt-1 min-w-48">
                {items.map((item, idx) => (
                  item.divider ? (
                    <div key={idx} className="h-px bg-slate-700 my-1" />
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setOpenMenu(null)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-600 transition-colors flex justify-between items-center text-sm"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-slate-400 ml-4">{item.shortcut}</span>
                      )}
                      {item.submenu && (
                        <span className="text-xs text-slate-400 ml-2">›</span>
                      )}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
