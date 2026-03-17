'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
}

interface ProjectContextType {
  project: Project
  setProject: (project: Project) => void
  createFile: (parentPath: string, fileName: string, content?: string) => void
  updateFile: (fileId: string, content: string) => void
  deleteFile: (fileId: string) => void
  renameFile: (fileId: string, newName: string) => void
  selectFile: (fileId: string) => void
  getFileById: (fileId: string) => ProjectFile | null
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(() => {
    // Initialize with default project
    return {
      id: 'default-project',
      name: 'My ESP32 Project',
      boardType: 'ESP32-S3',
      files: [
        {
          id: 'main.cpp',
          name: 'main.cpp',
          path: '/main.cpp',
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
          id: 'platformio.ini',
          name: 'platformio.ini',
          path: '/platformio.ini',
          content: `[env:esp32-s3-devkitc-1]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
monitor_speed = 115200
`,
          language: 'ini',
          isFolder: false,
        },
        {
          id: 'readme',
          name: 'README.md',
          path: '/README.md',
          content: `# ESP32 Project

A professional firmware development project for ESP32.

## Files
- \`main.cpp\` - Main application code
- \`platformio.ini\` - PlatformIO configuration

## Building
Click the "Compile" button to build the project.

## Flashing
Select your device and click "Flash" to upload the firmware.
`,
          language: 'markdown',
          isFolder: false,
        },
      ],
      selectedFile: 'main.cpp',
    }
  })

  // Load from localStorage on mount
  useEffect(() => {
    const savedProject = localStorage.getItem('hestia-project')
    if (savedProject) {
      try {
        setProject(JSON.parse(savedProject))
      } catch (e) {
        console.log('[v0] Failed to load project from localStorage')
      }
    }
  }, [])

  // Save to localStorage whenever project changes
  useEffect(() => {
    localStorage.setItem('hestia-project', JSON.stringify(project))
  }, [project])

  const findFileById = (fileId: string, files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (file.id === fileId) return file
      if (file.children) {
        const found = findFileById(fileId, file.children)
        if (found) return found
      }
    }
    return null
  }

  const updateFileInTree = (
    fileId: string,
    updater: (file: ProjectFile) => void,
    files: ProjectFile[]
  ): ProjectFile[] => {
    return files.map((file) => {
      if (file.id === fileId) {
        const updated = { ...file }
        updater(updated)
        return updated
      }
      if (file.children) {
        return {
          ...file,
          children: updateFileInTree(fileId, updater, file.children),
        }
      }
      return file
    })
  }

  const deleteFileFromTree = (fileId: string, files: ProjectFile[]): ProjectFile[] => {
    return files
      .filter((file) => file.id !== fileId)
      .map((file) => ({
        ...file,
        children: file.children ? deleteFileFromTree(fileId, file.children) : file.children,
      }))
  }

  const value: ProjectContextType = {
    project,
    setProject,
    selectFile: (fileId: string) => {
      setProject((prev) => ({ ...prev, selectedFile: fileId }))
    },
    getFileById: (fileId: string) => findFileById(fileId, project.files),
    updateFile: (fileId: string, content: string) => {
      setProject((prev) => ({
        ...prev,
        files: updateFileInTree(fileId, (file) => {
          file.content = content
        }, prev.files),
      }))
    },
    createFile: (parentPath: string, fileName: string, content = '') => {
      const newFile: ProjectFile = {
        id: `${parentPath}/${fileName}`.replace(/^\/+/, ''),
        name: fileName,
        path: `${parentPath}/${fileName}`,
        content,
        language: getLanguageFromFileName(fileName),
        isFolder: false,
      }

      setProject((prev) => ({
        ...prev,
        files: [...prev.files, newFile],
        selectedFile: newFile.id,
      }))
    },
    deleteFile: (fileId: string) => {
      setProject((prev) => {
        const newProject = { ...prev }
        newProject.files = deleteFileFromTree(fileId, prev.files)
        // Deselect if deleted file was selected
        if (prev.selectedFile === fileId) {
          newProject.selectedFile = prev.files[0]?.id || null
        }
        return newProject
      })
    },
    renameFile: (fileId: string, newName: string) => {
      setProject((prev) => ({
        ...prev,
        files: updateFileInTree(fileId, (file) => {
          file.name = newName
          file.language = getLanguageFromFileName(newName)
        }, prev.files),
      }))
    },
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    cpp: 'cpp',
    c: 'c',
    h: 'cpp',
    hpp: 'cpp',
    ino: 'cpp',
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    xml: 'xml',
    html: 'html',
    css: 'css',
    md: 'markdown',
    ini: 'ini',
    txt: 'plaintext',
  }
  return languageMap[ext || ''] || 'plaintext'
}
