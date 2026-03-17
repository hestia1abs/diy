'use client'

/**
 * @file lib/Api.ts
 * @description Typed API client for the HxTP backend, used by the DIY editor.
 * Covers firmware compilation and manifest endpoints.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL.trim().replace(/\/$/, '')}/v1`
  : "/api/v1"

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error: string; reason?: string },
  ) {
    super(body.error)
    this.name = "ApiError"
  }
}

function GetAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  return headers
}

// ── Firmware ─────────────────────────────────────────

export interface CompilePayload {
  source: string
  board: string
}

export async function CompileFirmware(
  token: string,
  payload: CompilePayload,
): Promise<Blob> {
  const res = await fetch(`${BASE}/firmware/build`, {
    method: "POST",
    credentials: "include",
    headers: GetAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let data = { error: "Firmware build failed" }
    try { data = await res.json() } catch { /* ignore */ }
    throw new ApiError(res.status, data)
  }

  return res.blob()
}

export async function CheckFirmware(
  token: string,
  params: { device_type: string; current_version: string },
): Promise<{ update_available: boolean; version?: string }> {
  const qs = new URLSearchParams(params)
  const res = await fetch(`${BASE}/firmware/check?${qs.toString()}`, {
    credentials: "include",
    headers: GetAuthHeaders(token),
  })

  if (!res.ok) {
    throw new ApiError(res.status, { error: "Firmware check failed" })
  }

  return res.json()
}

// ── Manifest ─────────────────────────────────────────

export interface CapEntry {
  id: number
  action: string
  description: string
  safetyClass: string
  paramSchema: { properties: Record<string, unknown> } | null
  supportsDryRun: boolean
}

export interface ManifestTypesResponse {
  categories: Record<string, Record<string, CapEntry[]>>
}

export async function GetManifestTypes(
  token: string,
): Promise<ManifestTypesResponse> {
  const res = await fetch(`${BASE}/manifest/types`, {
    credentials: "include",
    headers: GetAuthHeaders(token),
  })

  if (!res.ok) {
    throw new ApiError(res.status, { error: "Failed to fetch manifest types" })
  }

  return res.json()
}

export async function GetManifestCapabilities(
  token: string,
): Promise<{ capabilities: Record<string, CapEntry> }> {
  const res = await fetch(`${BASE}/manifest/capabilities`, {
    credentials: "include",
    headers: GetAuthHeaders(token),
  })

  if (!res.ok) {
    throw new ApiError(res.status, { error: "Failed to fetch capabilities" })
  }

  return res.json()
}

export { ApiError }
