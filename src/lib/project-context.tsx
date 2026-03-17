'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  isFolder: boolean
  children?: ProjectFile[]
}

export interface Project {
  id: string
  name: string
  boardType: string
  files: ProjectFile[]
  selectedFile: string | null
  openFiles: string[]
  dependencies: string[]
}

interface CursorPosition {
  line: number
  column: number
}

interface ProjectContextType {
  project: Project
  setProject: (project: Project) => void
  createFile: (parentPath: string, fileName: string, content?: string) => void
  createFolder: (parentPath: string, folderName: string) => void
  updateFile: (fileId: string, content: string) => void
  deleteFile: (fileId: string) => void
  renameFile: (fileId: string, newName: string) => void
  selectFile: (fileId: string) => void
  openFile: (fileId: string) => void
  closeFile: (fileId: string) => void
  getFileById: (fileId: string) => ProjectFile | null
  getAllFiles: () => ProjectFile[]
  dirtyFiles: Set<string>
  markDirty: (fileId: string) => void
  markClean: (fileId: string) => void
  saveAll: () => void
  cursorPosition: CursorPosition
  setCursorPosition: (pos: CursorPosition) => void
  importSource: (source: string, fileName?: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

const DEFAULT_PROJECT: Project = {
  id: 'default-project',
  name: 'My ESP32 Project',
  boardType: 'esp32',
  openFiles: ['main.ino'],
  dependencies: [],
  files: [
    {
      id: 'main.ino',
      name: 'main.ino',
      path: '/main.ino',
      content: `#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("ESP32 initialized!");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
`,
      language: 'cpp',
      isFolder: false,
    },
    {
      id: 'config.h',
      name: 'config.h',
      path: '/config.h',
      content: `#ifndef CONFIG_H
#define CONFIG_H

// Board Configuration
#define BOARD_TYPE ESP32_DEV_MODULE
#define CLOCK_SPEED 240

// Network Configuration
#define WIFI_SSID "your_ssid"
#define WIFI_PASSWORD "your_password"

// Device Configuration
#define DEVICE_NAME "MyDevice"
#define FIRMWARE_VERSION "1.0.0"

// Pin Definitions
#define LED_PIN 13
#define BUTTON_PIN 2

#endif
`,
      language: 'cpp',
      isFolder: false,
    },
    {
      id: 'readme',
      name: 'README.md',
      path: '/README.md',
      content: `# ESP32 Project

A firmware development project for ESP32.

## Files
- \`main.ino\` - Main application code
- \`config.h\` - Configuration header

## Building
Click the "Compile" button to build the project.
`,
      language: 'markdown',
      isFolder: false,
    },
  ],
  selectedFile: 'main.ino',
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(() => DEFAULT_PROJECT)
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set())
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ line: 1, column: 1 })
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedProject = localStorage.getItem('hestia-project')
    if (savedProject) {
      try {
        const parsed = JSON.parse(savedProject)
        // Ensure new fields exist with defaults
        if (!parsed.openFiles) parsed.openFiles = [parsed.selectedFile || parsed.files?.[0]?.id].filter(Boolean)
        if (!parsed.dependencies) parsed.dependencies = []
        setProject(parsed)
      } catch {
        console.warn('[DIY] Failed to load project from localStorage')
      }
    }

    // Check for imported source from URL
    const params = new URLSearchParams(window.location.search)
    const sourceParam = params.get('source')
    if (sourceParam) {
      try {
        const decoded = decodeURIComponent(escape(atob(sourceParam)))
        const importedFile: ProjectFile = {
          id: 'imported.ino',
          name: 'imported.ino',
          path: '/imported.ino',
          content: decoded,
          language: 'cpp',
          isFolder: false,
        }
        setProject((prev) => ({
          ...prev,
          files: [...prev.files.filter((f) => f.id !== 'imported.ino'), importedFile],
          selectedFile: 'imported.ino',
          openFiles: [...new Set([...prev.openFiles, 'imported.ino'])],
        }))
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
      } catch {
        console.warn('[DIY] Failed to decode imported source')
      }
    }
  }, [])

  // Debounced save to localStorage
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem('hestia-project', JSON.stringify(project))
    }, 500)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [project])

  const FindFileById = useCallback((fileId: string, files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (file.id === fileId) return file
      if (file.children) {
        const found = FindFileById(fileId, file.children)
        if (found) return found
      }
    }
    return null
  }, [])

  const CollectAllFiles = useCallback((files: ProjectFile[]): ProjectFile[] => {
    const result: ProjectFile[] = []
    for (const file of files) {
      if (!file.isFolder) result.push(file)
      if (file.children) result.push(...CollectAllFiles(file.children))
    }
    return result
  }, [])

  const UpdateFileInTree = useCallback((
    fileId: string,
    updater: (file: ProjectFile) => void,
    files: ProjectFile[],
  ): ProjectFile[] => {
    return files.map((file) => {
      if (file.id === fileId) {
        const updated = { ...file }
        updater(updated)
        return updated
      }
      if (file.children) {
        return { ...file, children: UpdateFileInTree(fileId, updater, file.children) }
      }
      return file
    })
  }, [])

  const DeleteFileFromTree = useCallback((fileId: string, files: ProjectFile[]): ProjectFile[] => {
    return files
      .filter((file) => file.id !== fileId)
      .map((file) => ({
        ...file,
        children: file.children ? DeleteFileFromTree(fileId, file.children) : file.children,
      }))
  }, [])

  const value: ProjectContextType = {
    project,
    setProject,
    cursorPosition,
    setCursorPosition,
    dirtyFiles,

    markDirty: (fileId: string) => {
      setDirtyFiles((prev) => new Set(prev).add(fileId))
    },

    markClean: (fileId: string) => {
      setDirtyFiles((prev) => {
        const next = new Set(prev)
        next.delete(fileId)
        return next
      })
    },

    saveAll: () => {
      setDirtyFiles(new Set())
      localStorage.setItem('hestia-project', JSON.stringify(project))
    },

    selectFile: (fileId: string) => {
      setProject((prev) => ({ ...prev, selectedFile: fileId }))
    },

    openFile: (fileId: string) => {
      setProject((prev) => ({
        ...prev,
        selectedFile: fileId,
        openFiles: prev.openFiles.includes(fileId) ? prev.openFiles : [...prev.openFiles, fileId],
      }))
    },

    closeFile: (fileId: string) => {
      setProject((prev) => {
        const newOpen = prev.openFiles.filter((id) => id !== fileId)
        const newSelected = prev.selectedFile === fileId
          ? (newOpen[newOpen.length - 1] || null)
          : prev.selectedFile
        return { ...prev, openFiles: newOpen, selectedFile: newSelected }
      })
      setDirtyFiles((prev) => {
        const next = new Set(prev)
        next.delete(fileId)
        return next
      })
    },

    getFileById: (fileId: string) => FindFileById(fileId, project.files),

    getAllFiles: () => CollectAllFiles(project.files),

    updateFile: (fileId: string, content: string) => {
      setProject((prev) => ({
        ...prev,
        files: UpdateFileInTree(fileId, (file) => { file.content = content }, prev.files),
      }))
    },

    createFile: (parentPath: string, fileName: string, content = '') => {
      const newFile: ProjectFile = {
        id: `${parentPath}/${fileName}`.replace(/^\/+/, ''),
        name: fileName,
        path: `${parentPath}/${fileName}`,
        content,
        language: GetLanguageFromFileName(fileName),
        isFolder: false,
      }
      setProject((prev) => ({
        ...prev,
        files: [...prev.files, newFile],
        selectedFile: newFile.id,
        openFiles: [...prev.openFiles, newFile.id],
      }))
    },

    createFolder: (parentPath: string, folderName: string) => {
      const newFolder: ProjectFile = {
        id: `${parentPath}/${folderName}`.replace(/^\/+/, ''),
        name: folderName,
        path: `${parentPath}/${folderName}`,
        content: '',
        language: '',
        isFolder: true,
        children: [],
      }
      setProject((prev) => ({
        ...prev,
        files: [...prev.files, newFolder],
      }))
    },

    deleteFile: (fileId: string) => {
      setProject((prev) => {
        const newFiles = DeleteFileFromTree(fileId, prev.files)
        const newOpen = prev.openFiles.filter((id) => id !== fileId)
        const newSelected = prev.selectedFile === fileId
          ? (newOpen[0] || null)
          : prev.selectedFile
        return { ...prev, files: newFiles, openFiles: newOpen, selectedFile: newSelected }
      })
    },

    renameFile: (fileId: string, newName: string) => {
      setProject((prev) => ({
        ...prev,
        files: UpdateFileInTree(fileId, (file) => {
          file.name = newName
          file.language = GetLanguageFromFileName(newName)
        }, prev.files),
      }))
    },

    importSource: (source: string, fileName = 'imported.ino') => {
      const importedFile: ProjectFile = {
        id: fileName,
        name: fileName,
        path: `/${fileName}`,
        content: source,
        language: GetLanguageFromFileName(fileName),
        isFolder: false,
      }
      setProject((prev) => ({
        ...prev,
        files: [...prev.files.filter((f) => f.id !== fileName), importedFile],
        selectedFile: fileName,
        openFiles: [...new Set([...prev.openFiles, fileName])],
      }))
    },
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProject must be used within ProjectProvider')
  return context
}

function GetLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    cpp: 'cpp', c: 'c', h: 'cpp', hpp: 'cpp', ino: 'cpp',
    py: 'python', js: 'javascript', ts: 'typescript',
    json: 'json', xml: 'xml', html: 'html', css: 'css',
    md: 'markdown', ini: 'ini', txt: 'plaintext',
  }
  return languageMap[ext || ''] || 'plaintext'
}
