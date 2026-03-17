'use client'

import { ChevronRight, FileText, Folder, Plus, Trash2, Edit3, FolderPlus, FilePlus } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useProject } from '@/lib/project-context'
import type { ProjectFile } from '@/lib/project-context'

export function ExplorerPanel() {
  const { project, openFile, createFile, createFolder, deleteFile, renameFile } = useProject()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null)

  const ToggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }, [])

  const HandleFileClick = useCallback((fileId: string) => {
    openFile(fileId)
  }, [openFile])

  const HandleRenameStart = useCallback((fileId: string, currentName: string) => {
    setRenamingId(fileId)
    setRenameValue(currentName)
    setContextMenu(null)
  }, [])

  const HandleRenameSubmit = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameFile(renamingId, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }, [renamingId, renameValue, renameFile])

  const HandleNewFile = useCallback(() => {
    if (newFileName.trim()) {
      createFile('/', newFileName.trim())
      setNewFileName('')
      setShowNewFileInput(false)
    }
  }, [newFileName, createFile])

  const HandleContextMenu = useCallback((e: React.MouseEvent, fileId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, fileId })
  }, [])

  const HandleDelete = useCallback((fileId: string) => {
    deleteFile(fileId)
    setContextMenu(null)
  }, [deleteFile])

  const GetFileIcon = (name: string) => {
    if (name.endsWith('.ino')) return '◆'
    if (name.endsWith('.h') || name.endsWith('.hpp')) return 'H'
    if (name.endsWith('.cpp') || name.endsWith('.c')) return 'C'
    if (name.endsWith('.md')) return 'M'
    if (name.endsWith('.json')) return '{}'
    return '◇'
  }

  const GetIconColor = (name: string) => {
    if (name.endsWith('.ino')) return 'text-cyan-400'
    if (name.endsWith('.h') || name.endsWith('.hpp')) return 'text-purple-400'
    if (name.endsWith('.cpp') || name.endsWith('.c')) return 'text-blue-400'
    if (name.endsWith('.md')) return 'text-slate-400'
    return 'text-slate-500'
  }

  function RenderFile(file: ProjectFile, depth: number) {
    const isSelected = project.selectedFile === file.id
    const isRenaming = renamingId === file.id
    const paddingLeft = 12 + depth * 16

    if (file.isFolder) {
      const isExpanded = expandedFolders.has(file.id)
      return (
        <div key={file.id}>
          <button
            onClick={() => ToggleFolder(file.id)}
            onContextMenu={(e) => HandleContextMenu(e, file.id)}
            style={{ paddingLeft }}
            className="w-full flex items-center gap-1.5 py-1 pr-2 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-200 text-sm"
          >
            <ChevronRight
              size={14}
              className={`transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            />
            <Folder size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">{file.name}</span>
          </button>
          {isExpanded && file.children?.map((child) => RenderFile(child, depth + 1))}
        </div>
      )
    }

    return (
      <button
        key={file.id}
        onClick={() => HandleFileClick(file.id)}
        onContextMenu={(e) => HandleContextMenu(e, file.id)}
        style={{ paddingLeft }}
        className={`w-full flex items-center gap-1.5 py-1 pr-2 rounded transition-colors text-sm ${
          isSelected
            ? 'bg-blue-600/20 text-blue-300'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
      >
        <span className={`text-xs shrink-0 w-4 text-center ${GetIconColor(file.name)}`}>
          {GetFileIcon(file.name)}
        </span>
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={HandleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') HandleRenameSubmit()
              if (e.key === 'Escape') { setRenamingId(null); setRenameValue('') }
            }}
            className="flex-1 bg-slate-700 text-slate-200 text-xs px-1 py-0.5 rounded outline-none border border-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate text-xs">{file.name}</span>
        )}
      </button>
    )
  }

  return (
    <div
      className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden"
      onClick={() => setContextMenu(null)}
    >
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">EXPLORER</span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowNewFileInput(true)}
            className="text-slate-400 hover:text-slate-100 p-1 transition-colors rounded hover:bg-slate-700"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => createFolder('/', 'new-folder')}
            className="text-slate-400 hover:text-slate-100 p-1 transition-colors rounded hover:bg-slate-700"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* Project name */}
      <div className="px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Folder size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider truncate">
            {project.name}
          </span>
        </div>
      </div>

      {/* New file input */}
      {showNewFileInput && (
        <div className="px-4 py-2 border-b border-slate-800">
          <input
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') HandleNewFile()
              if (e.key === 'Escape') { setShowNewFileInput(false); setNewFileName('') }
            }}
            onBlur={() => { setShowNewFileInput(false); setNewFileName('') }}
            placeholder="filename.ino"
            className="w-full bg-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded outline-none border border-blue-500 placeholder-slate-600"
          />
        </div>
      )}

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {project.files.map((file) => RenderFile(file, 0))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-36"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => HandleRenameStart(contextMenu.fileId, project.files.find(f => f.id === contextMenu.fileId)?.name || '')}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-2"
          >
            <Edit3 size={12} /> Rename
          </button>
          <button
            onClick={() => HandleDelete(contextMenu.fileId)}
            className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-slate-700 flex items-center gap-2"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
