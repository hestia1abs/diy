'use client'

/**
 * @file lib/WebSerial.ts
 * @description Utility for interacting with the browser Web Serial API.
 *
 * The Web Serial API is only supported in Chromium-based browsers
 * (Chrome, Edge, Opera). This module provides a safe wrapper with
 * feature detection, port selection, read/write, and cleanup.
 */

export interface SerialOptions {
  baudRate: number
  dataBits?: number
  stopBits?: number
  parity?: ParityType
  bufferSize?: number
  flowControl?: FlowControlType
}

export type SerialEventHandler = (data: string) => void
export type SerialErrorHandler = (error: Error) => void

export function IsWebSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator
}

export class WebSerialConnection {
  private port: SerialPort | null = null
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null
  private decoder = new TextDecoder()
  private encoder = new TextEncoder()
  private readLoop: Promise<void> | null = null
  private abortController: AbortController | null = null

  private onData: SerialEventHandler | null = null
  private onError: SerialErrorHandler | null = null
  private onDisconnect: (() => void) | null = null

  /** Register a callback for incoming serial data */
  SetOnData(handler: SerialEventHandler) {
    this.onData = handler
  }

  /** Register a callback for serial errors */
  SetOnError(handler: SerialErrorHandler) {
    this.onError = handler
  }

  /** Register a callback for disconnection */
  SetOnDisconnect(handler: () => void) {
    this.onDisconnect = handler
  }

  /** Whether a port is currently open and readable */
  get IsConnected(): boolean {
    return this.port !== null && this.port.readable !== null
  }

  /**
   * Prompt the user to select a serial port and open a connection.
   * Throws if the user cancels or the port cannot be opened.
   */
  async Connect(options: SerialOptions): Promise<void> {
    if (!IsWebSerialSupported()) {
      throw new Error('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.')
    }

    // Request port from user
    this.port = await navigator.serial.requestPort()

    // Listen for disconnect
    navigator.serial.addEventListener('disconnect', this.HandleDisconnect)

    // Open the port
    await this.port.open({
      baudRate: options.baudRate,
      dataBits: options.dataBits ?? 8,
      stopBits: options.stopBits ?? 1,
      parity: options.parity ?? 'none',
      bufferSize: options.bufferSize ?? 255,
      flowControl: options.flowControl ?? 'none',
    })

    // Start reading
    this.abortController = new AbortController()
    this.readLoop = this.StartReading()
  }

  /** Write a string to the serial port */
  async Write(data: string): Promise<void> {
    if (!this.port?.writable) {
      throw new Error('Serial port is not open for writing')
    }

    this.writer = this.port.writable.getWriter()
    try {
      await this.writer.write(this.encoder.encode(data))
    } finally {
      this.writer.releaseLock()
      this.writer = null
    }
  }

  /** Write a string followed by a newline */
  async WriteLine(data: string): Promise<void> {
    await this.Write(data + '\n')
  }

  /** Close the serial port and clean up resources */
  async Disconnect(): Promise<void> {
    this.abortController?.abort()

    if (this.reader) {
      try {
        await this.reader.cancel()
      } catch {
        // Reader may already be released
      }
      this.reader = null
    }

    if (this.writer) {
      try {
        this.writer.releaseLock()
      } catch {
        // Writer may already be released
      }
      this.writer = null
    }

    if (this.port) {
      try {
        await this.port.close()
      } catch {
        // Port may already be closed
      }
      navigator.serial.removeEventListener('disconnect', this.HandleDisconnect)
      this.port = null
    }
  }

  /** Continuously read from the serial port until cancelled or error */
  private async StartReading(): Promise<void> {
    if (!this.port?.readable) return

    while (this.port.readable && !this.abortController?.signal.aborted) {
      this.reader = this.port.readable.getReader()
      try {
        while (true) {
          const { value, done } = await this.reader.read()
          if (done) break
          if (value) {
            const decoded = this.decoder.decode(value, { stream: true })
            this.onData?.(decoded)
          }
        }
      } catch (error) {
        if (!this.abortController?.signal.aborted) {
          this.onError?.(error instanceof Error ? error : new Error(String(error)))
        }
      } finally {
        try {
          this.reader.releaseLock()
        } catch {
          // Reader lock may already be released
        }
        this.reader = null
      }
    }
  }

  private HandleDisconnect = () => {
    this.port = null
    this.reader = null
    this.writer = null
    this.onDisconnect?.()
  }
}
