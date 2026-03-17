'use client'

import { useCallback, useEffect, useRef } from 'react'
import { X, Circle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useProject } from '@/lib/project-context'
import type { editor } from 'monaco-editor'

const Editor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-400">Loading editor...</div>
})

export function EditorPanel({ sidebarActive }: { sidebarActive: boolean }) {
  const {
    project,
    openFile,
    closeFile,
    selectFile,
    updateFile,
    getFileById,
    dirtyFiles,
    markDirty,
    saveAll,
    setCursorPosition,
  } = useProject()

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const activeFile = project.selectedFile ? getFileById(project.selectedFile) : null

  const HandleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && project.selectedFile) {
      updateFile(project.selectedFile, value)
      markDirty(project.selectedFile)
    }
  }, [project.selectedFile, updateFile, markDirty])

  const HandleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({ line: e.position.lineNumber, column: e.position.column })
    })

    // Keyboard shortcut: Ctrl+S to save
    editor.addCommand(
      // eslint-disable-next-line no-bitwise
      2048 | 49, // KeyMod.CtrlCmd | KeyCode.KeyS
      () => {
        saveAll()
      }
    )
  }, [setCursorPosition, saveAll])

  const GetFileIcon = (name: string) => {
    if (name.endsWith('.ino')) return '◆'
    if (name.endsWith('.h') || name.endsWith('.hpp')) return 'H'
    if (name.endsWith('.cpp') || name.endsWith('.c')) return 'C'
    if (name.endsWith('.md')) return 'M'
    if (name.endsWith('.json')) return '{}'
    if (name.endsWith('.ini')) return '⚙'
    return '◇'
  }

  const GetFileIconColor = (name: string) => {
    if (name.endsWith('.ino')) return 'text-cyan-400'
    if (name.endsWith('.h') || name.endsWith('.hpp')) return 'text-purple-400'
    if (name.endsWith('.cpp') || name.endsWith('.c')) return 'text-blue-400'
    if (name.endsWith('.md')) return 'text-slate-400'
    return 'text-slate-500'
  }

  // Scroll active tab into view
  useEffect(() => {
    const activeTab = document.querySelector('[data-active-tab="true"]')
    activeTab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [project.selectedFile])

  if (!activeFile && project.openFiles.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 text-slate-500">
        <div className="text-6xl mb-4 opacity-20">◆</div>
        <p className="text-sm">Open a file from the Explorer to start editing</p>
        <p className="text-xs mt-1 text-slate-600">Ctrl+N to create a new file</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
      {/* Breadcrumb */}
      <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center px-3 text-xs text-slate-500 gap-1">
        {activeFile && (
          <>
            <span>{project.name}</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-300">{activeFile.name}</span>
            {dirtyFiles.has(activeFile.id) && (
              <span className="text-amber-400 ml-1">●</span>
            )}
          </>
        )}
      </div>

      {/* File tabs */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center overflow-hidden">
        <div className="flex overflow-x-auto flex-1 items-center gap-0.5 px-1 scrollbar-none">
          {project.openFiles.map((fileId) => {
            const file = getFileById(fileId)
            if (!file) return null
            const isActive = project.selectedFile === fileId
            const isDirty = dirtyFiles.has(fileId)
            return (
              <button
                key={fileId}
                data-active-tab={isActive}
                onClick={() => selectFile(fileId)}
                className={`h-8 px-3 py-1 rounded-t flex items-center gap-2 whitespace-nowrap transition-colors text-sm group min-w-0 ${
                  isActive
                    ? 'bg-slate-950 text-slate-100 border-t-2 border-t-blue-500'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
                title={file.name}
              >
                <span className={`text-xs ${GetFileIconColor(file.name)}`}>{GetFileIcon(file.name)}</span>
                <span className="truncate max-w-[120px]">{file.name}</span>
                {isDirty ? (
                  <Circle size={8} className="text-amber-400 fill-amber-400 shrink-0" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeFile(fileId)
                    }}
                    className="hover:bg-slate-600 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <X size={12} />
                  </button>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {activeFile ? (
          <Editor
            key={activeFile.id}
            height="100%"
            language={activeFile.language}
            value={activeFile.content}
            onChange={HandleEditorChange}
            onMount={HandleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: true, maxColumn: 80 },
              fontSize: 13,
              fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
              fontLigatures: true,
              lineHeight: 1.6,
              padding: { top: 12, bottom: 12 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              contextmenu: true,
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoIndent: 'full',
              formatOnPaste: true,
              tabSize: 2,
              wordWrap: 'off',
              rulers: [80, 120],
              renderWhitespace: 'selection',
              suggestOnTriggerCharacters: true,
              quickSuggestions: { other: true, comments: false, strings: false },
              parameterHints: { enabled: true },
              suggest: {
                showKeywords: true,
                showSnippets: true,
                showFunctions: true,
                showVariables: true,
              },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  )
}
