'use client'

import { ChevronRight, FileText, Folder, Plus, MoreVertical } from 'lucide-react'
import { useState } from 'react'

export function ExplorerPanel() {
  const [expanded, setExpanded] = useState({
    sketchbook: true,
    blueled: true,
  })

  const fileTree = [
    {
      id: 'sketchbook',
      name: 'SKETCHBOOK',
      type: 'folder',
      expanded: expanded.sketchbook,
      children: [
        {
          id: 'blueled',
          name: 'BlueLED',
          type: 'folder',
          expanded: expanded.blueled,
          children: [
            { id: 'file1', name: 'BlueLED.ino', type: 'file' },
            { id: 'file2', name: 'config.h', type: 'file' },
          ],
        },
        {
          id: 'blinky',
          name: 'Blinky',
          type: 'folder',
          children: [
            { id: 'file3', name: 'Blinky.ino', type: 'file' },
          ],
        },
      ],
    },
  ]

  const toggleFolder = (id: string) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4">
        <span className="text-sm font-semibold text-slate-200">EXPLORER</span>
        <button className="text-slate-400 hover:text-slate-100 p-1 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto p-2 text-sm">
        {fileTree.map(folder => (
          <div key={folder.id}>
            <button
              onClick={() => toggleFolder(folder.id)}
              className="w-full flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-slate-100"
            >
              <ChevronRight
                size={16}
                className={`transition-transform ${expanded[folder.id as keyof typeof expanded] ? 'rotate-90' : ''}`}
              />
              <Folder size={16} />
              <span className="font-medium">{folder.name}</span>
            </button>

            {/* Nested items */}
            {expanded[folder.id as keyof typeof expanded] && folder.children && (
              <div className="pl-4">
                {folder.children.map((child) => (
                  <div key={child.id}>
                    {child.type === 'folder' ? (
                      <>
                        <button
                          onClick={() => toggleFolder(child.id)}
                          className="w-full flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200"
                        >
                          <ChevronRight
                            size={16}
                            className={`transition-transform ${expanded[child.id as keyof typeof expanded] ? 'rotate-90' : ''}`}
                          />
                          <Folder size={14} />
                          <span>{child.name}</span>
                        </button>

                        {/* Nested files */}
                        {expanded[child.id as keyof typeof expanded] && child.children && (
                          <div className="pl-4">
                            {child.children.map(file => (
                              <button
                                key={file.id}
                                className="w-full flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200"
                              >
                                <FileText size={14} />
                                <span className="text-xs">{file.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button className="w-full flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200">
                        <FileText size={14} />
                        <span className="text-xs">{child.name}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
