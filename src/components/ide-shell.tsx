'use client'

import { useState } from 'react'
import { MenuBar } from './menu-bar'
import { Sidebar } from './sidebar'
import { EditorPanel } from './editor-panel'
import { ToolPanels } from './tool-panels'
import { StatusBar } from './status-bar'
import { ExplorerPanel } from './explorer-panel'
import { LibrariesPanel } from './libraries-panel'
import { BoardsPanel } from './boards-panel'
import { SearchPanel } from './search-panel'
import { DebugPanel } from './debug-panel'
import { SourcePanel } from './source-panel'
import { CompileToolbar } from './compile-toolbar'

export function IDEShell() {
  const [activePanel, setActivePanel] = useState<'explorer' | 'search' | 'source' | 'debug' | 'libraries' | 'boards' | 'extensions'>('explorer')
  const [showLeftPanel, setShowLeftPanel] = useState(true)

  const renderLeftPanel = () => {
    switch (activePanel) {
      case 'explorer':
        return <ExplorerPanel />
      case 'search':
        return <SearchPanel />
      case 'source':
        return <SourcePanel />
      case 'debug':
        return <DebugPanel />
      case 'libraries':
        return <LibrariesPanel />
      case 'boards':
        return <BoardsPanel />
      default:
        return <ExplorerPanel />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      <MenuBar />
      <CompileToolbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Icon Sidebar */}
        <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />
        
        {/* Left Panel (Explorer/Libraries/Boards) */}
        {showLeftPanel && (
          <div className="w-80 border-r border-slate-700 flex flex-col">
            {renderLeftPanel()}
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor area */}
          <EditorPanel sidebarActive={showLeftPanel} />
          
          {/* Bottom panels (console, debug output) */}
          <ToolPanels activePanel={activePanel} />
        </div>
      </div>
      
      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
