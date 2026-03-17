'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { useProject } from '@/lib/project-context'
import { useConsole } from '@/lib/console-context'

interface MenuItem {
  label: string
  shortcut?: string
  action?: () => void
  separator?: boolean
  submenu?: MenuItem[]
}

export function MenuBar() {
  const { project, setProject, createFile, saveAll } = useProject()
  const { addLog, clearLogs } = useConsole()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const HandleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', HandleClickOutside)
    return () => document.removeEventListener('mousedown', HandleClickOutside)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const HandleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveAll()
        addLog('Project saved.', 'success')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        createFile('/', 'untitled.ino')
      }
    }
    window.addEventListener('keydown', HandleKeyDown)
    return () => window.removeEventListener('keydown', HandleKeyDown)
  }, [saveAll, createFile, addLog])

  const HandleMenuAction = useCallback((action?: () => void) => {
    if (action) action()
    setOpenMenu(null)
  }, [])

  const menus: Record<string, MenuItem[]> = {
    File: [
      { label: 'New Sketch', shortcut: 'Ctrl+N', action: () => createFile('/', 'untitled.ino') },
      { separator: true, label: '' },
      { label: 'Save', shortcut: 'Ctrl+S', action: () => { saveAll(); addLog('Project saved.', 'success') } },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
      { separator: true, label: '' },
      { label: 'Preferences', shortcut: 'Ctrl+,' },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', shortcut: 'Ctrl+Y' },
      { separator: true, label: '' },
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', shortcut: 'Ctrl+V' },
      { separator: true, label: '' },
      { label: 'Find', shortcut: 'Ctrl+F' },
      { label: 'Replace', shortcut: 'Ctrl+H' },
    ],
    Sketch: [
      { label: 'Verify/Compile', shortcut: 'Ctrl+R' },
      { label: 'Upload', shortcut: 'Ctrl+U' },
      { separator: true, label: '' },
      { label: 'Export Compiled Binary' },
      { label: 'Include Library', submenu: [
        { label: 'Manage Libraries...' },
        { separator: true, label: '' },
        { label: 'WiFi' },
        { label: 'ArduinoJson' },
        { label: 'PubSubClient' },
      ]},
    ],
    Tools: [
      { label: 'Serial Monitor', shortcut: 'Ctrl+Shift+M' },
      { label: 'Serial Plotter' },
      { separator: true, label: '' },
      { label: 'Board Manager...' },
      { label: 'Board', submenu: [
        { label: 'ESP32 Dev Module' },
        { label: 'ESP8266 NodeMCU' },
        { label: 'ESP32-S3 DevKitC' },
      ]},
      { separator: true, label: '' },
      { label: 'Clear Output', action: () => clearLogs() },
    ],
    Help: [
      { label: 'Getting Started' },
      { label: 'Arduino Reference' },
      { separator: true, label: '' },
      { label: 'Hestia Documentation' },
      { label: 'About Hestia DIY Editor' },
    ],
  }

  return (
    <div ref={menuRef} className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-2 gap-0 select-none">
      {/* App branding */}
      <div className="flex items-center gap-2 px-2 mr-2">
        <span className="font-bold text-cyan-400 text-xs">◆</span>
        <span className="text-xs font-semibold text-slate-300 tracking-wide">Hestia DIY</span>
      </div>

      {Object.entries(menus).map(([name, items]) => (
        <div key={name} className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === name ? null : name)}
            onMouseEnter={() => { if (openMenu) setOpenMenu(name) }}
            className={`px-2.5 py-1 text-xs transition-colors rounded ${
              openMenu === name
                ? 'text-white bg-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {name}
          </button>
          {openMenu === name && (
            <div className="absolute left-0 top-full mt-0.5 bg-slate-800 border border-slate-600 rounded-lg shadow-xl min-w-48 py-1 z-50">
              {items.map((item, idx) => {
                if (item.separator) {
                  return <div key={idx} className="h-px bg-slate-700 my-1" />
                }
                return (
                  <button
                    key={idx}
                    onClick={() => HandleMenuAction(item.action)}
                    className="w-full text-left flex items-center justify-between px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {item.submenu && <ChevronRight size={10} className="text-slate-500" />}
                    </span>
                    {item.shortcut && (
                      <span className="text-[10px] text-slate-500 ml-6">{item.shortcut}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
