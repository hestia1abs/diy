'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-400">Loading editor...</div>
})

interface File {
  id: string
  name: string
  language: string
  content: string
}

export function EditorPanel({ sidebarActive }: { sidebarActive: boolean }) {
  const [files, setFiles] = useState<File[]>([
    {
      id: '1',
      name: 'BlueLED.ino',
      language: 'cpp',
      content: `// ----- HxTP Provisioning Payload ----
// Copy these values from the Hestia Labs Cloud Console when provisioning a device
static const char* API_BASE_URL = "https://cloud.hestialabs.in/api/v1";
static const char* DEVICE_ID = "fc205f63-9f70-48ae-9740-3872bb718511";
static const char* TENANT_ID = "b6865f98-4627-4869-b399-ae3499b0d30a";
static const char* DEVICE_SECRET = "99031887a84ba0cbe7ceb588b3596392cf07fc5d5fe0c5e22e534a6c354cd2f1";

// ----- Global HxTP Client ----
hxtp::HXTPClient* hxtpClient = nullptr;

// ----- SDK Event Callbacks ----
void onHxtpStateChange(hxtp::HxtpClientState oldState, hxtp::HxtpClientState newState, void*) {
  Serial.println("[HXTP] State changed to: ");
  Serial.println(hxtpClient->stateStr());
}

void onHxtpError(HxtpError err, const char* msg, void*) {
  Serial.printf("[HXTP] ERROR %d: %s\\n", static_cast<int>(err), msg ? msg : "Unknown");
}`,
    },
    {
      id: '2',
      name: 'config.h',
      language: 'cpp',
      content: `#ifndef CONFIG_H
#define CONFIG_H

// Board Configuration
#define BOARD_TYPE ESP32_DEV_MODULE
#define CLOCK_SPEED 240
#define FLASH_SIZE 4096

// Network Configuration
#define WIFI_SSID "your_ssid"
#define WIFI_PASSWORD "your_password"
#define NTP_SERVER "pool.ntp.org"

// Device Configuration
#define DEVICE_NAME "BlueLED"
#define FIRMWARE_VERSION "1.0.0"

// Pin Definitions
#define LED_PIN 13
#define BUTTON_PIN 2
#define SENSOR_PIN A0

#endif`,
    },
  ])

  const [activeFileId, setActiveFileId] = useState(files[0].id)
  const [tabScroll, setTabScroll] = useState(0)

  const activeFile = files.find(f => f.id === activeFileId) || files[0]

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setFiles(files.map(f => f.id === activeFileId ? { ...f, content: value } : f))
    }
  }

  const closeFile = (id: string) => {
    const newFiles = files.filter(f => f.id !== id)
    if (newFiles.length === 0) return
    setFiles(newFiles)
    if (activeFileId === id) {
      setActiveFileId(newFiles[0].id)
    }
  }

  const getFileIcon = (name: string) => {
    if (name.endsWith('.ino')) return '◆'
    if (name.endsWith('.h')) return 'H'
    if (name.endsWith('.cpp')) return '◆'
    return '◇'
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
      {/* Breadcrumb */}
      <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center px-3 text-xs text-slate-500 gap-1">
        {activeFile && (
          <>
            <span>BlueLED</span>
            <span>/</span>
            <span className="text-slate-300">{activeFile.name}</span>
          </>
        )}
      </div>

      {/* File tabs */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center overflow-hidden gap-1 px-1">
        <div className="flex overflow-x-auto flex-1 items-center gap-0.5">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`h-8 px-3 py-1 rounded-t flex items-center gap-2 whitespace-nowrap transition-colors text-sm ${
                activeFileId === file.id
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
              }`}
              title={file.name}
            >
              <span className="text-xs opacity-75">{getFileIcon(file.name)}</span>
              <span>{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeFile(file.id)
                }}
                className="hover:bg-slate-600 rounded p-0.5 ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </button>
          ))}
        </div>

        {/* More options */}
        <div className="h-8 border-l border-slate-700 flex items-center px-2">
          <button className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded hover:bg-slate-700">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={activeFile.language}
          value={activeFile.content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Fira Code', monospace",
            lineHeight: 1.6,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'blink',
            contextmenu: true,
            renderLineHighlight: 'line',
          }}
        />
      </div>
    </div>
  )
}
