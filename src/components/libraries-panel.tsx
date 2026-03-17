'use client'

import { Search, Download, CheckCircle, BookOpen } from 'lucide-react'
import { useState, useMemo } from 'react'

interface Library {
  name: string
  author: string
  version: string
  description: string
  installed: boolean
  category: string
}

const LIBRARY_CATALOG: Library[] = [
  { name: 'WiFi', author: 'Arduino', version: '1.2.7', description: 'Enables network connection using 802.11 WiFi.', installed: true, category: 'Communication' },
  { name: 'ArduinoJson', author: 'Benoit Blanchon', version: '7.3.0', description: 'Memory-efficient JSON parsing and serialization.', installed: true, category: 'Data Processing' },
  { name: 'PubSubClient', author: 'Nick O\'Leary', version: '2.8.0', description: 'MQTT client library for Arduino.', installed: false, category: 'Communication' },
  { name: 'Adafruit NeoPixel', author: 'Adafruit', version: '1.12.3', description: 'Driver for WS2812B addressable LEDs.', installed: false, category: 'Display' },
  { name: 'FastLED', author: 'Daniel Garcia', version: '3.9.3', description: 'High-performance LED animation library.', installed: false, category: 'Display' },
  { name: 'ESPAsyncWebServer', author: 'Me-No-Dev', version: '1.2.7', description: 'Async HTTP/WebSocket server for ESP32/ESP8266.', installed: false, category: 'Communication' },
  { name: 'OneWire', author: 'Tom Pollard', version: '2.3.8', description: 'Access Dallas/Maxim 1-Wire sensor chips.', installed: false, category: 'Sensors' },
  { name: 'DHT sensor library', author: 'Adafruit', version: '1.4.6', description: 'Temperature and humidity sensor library.', installed: false, category: 'Sensors' },
  { name: 'Servo', author: 'Arduino', version: '1.2.2', description: 'Control RC servo motors.', installed: false, category: 'Motor' },
  { name: 'Wire', author: 'Arduino', version: '2.0.0', description: 'I2C communication library.', installed: true, category: 'Communication' },
]

export function LibrariesPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'installed'>('all')
  const [libraries, setLibraries] = useState(LIBRARY_CATALOG)

  const filtered = useMemo(() => {
    return libraries.filter((lib) => {
      if (filter === 'installed' && !lib.installed) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return lib.name.toLowerCase().includes(q) || lib.author.toLowerCase().includes(q)
      }
      return true
    })
  }, [libraries, searchQuery, filter])

  const HandleInstall = (name: string) => {
    setLibraries((prev) => prev.map((lib) =>
      lib.name === name ? { ...lib, installed: true } : lib
    ))
  }

  const HandleRemove = (name: string) => {
    setLibraries((prev) => prev.map((lib) =>
      lib.name === name ? { ...lib, installed: false } : lib
    ))
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-hidden">
      <div className="h-12 border-b border-slate-700 flex items-center px-4">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">LIBRARY MANAGER</span>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-700 space-y-2">
        <div className="flex items-center bg-slate-800 rounded px-2 py-1.5 border border-slate-700">
          <Search size={14} className="text-slate-500" />
          <input
            placeholder="Filter libraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-2 bg-transparent outline-none text-xs text-slate-200 placeholder-slate-500"
          />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setFilter('all')} className={`text-[10px] px-2 py-0.5 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>All</button>
          <button onClick={() => setFilter('installed')} className={`text-[10px] px-2 py-0.5 rounded ${filter === 'installed' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Installed</button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((lib) => (
          <div key={lib.name} className="px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={12} className="text-cyan-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">{lib.name}</span>
                  <span className="text-[10px] text-slate-500">v{lib.version}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">by {lib.author}</p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{lib.description}</p>
              </div>
              {lib.installed ? (
                <button onClick={() => HandleRemove(lib.name)} className="shrink-0 text-[10px] px-2 py-1 rounded bg-green-900/30 text-green-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
                  Installed
                </button>
              ) : (
                <button onClick={() => HandleInstall(lib.name)} className="shrink-0 text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors">
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-xs text-slate-500 text-center py-6">No libraries found.</div>
        )}
      </div>
    </div>
  )
}
