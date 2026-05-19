import LZString from 'lz-string'

const MAX_ENCODED_LENGTH = 110_000

export function encodeSharePayload(json: object): { ok: true; payload: string } | { ok: false; reason: string } {
  try {
    const raw = JSON.stringify(json)
    const enc = LZString.compressToEncodedURIComponent(raw)
    if (!enc || enc.length > MAX_ENCODED_LENGTH) {
      return {
        ok: false,
        reason:
          enc.length > MAX_ENCODED_LENGTH
            ? 'งานใหญ่เกินไปสำหรับลิงก์ — ใช้ส่งไฟล์ JSON แทน'
            : 'บีบอัดลิงก์ไม่สำเร็จ',
      }
    }
    return { ok: true, payload: enc }
  } catch {
    return { ok: false, reason: 'สร้างลิงก์ไม่สำเร็จ' }
  }
}

export function decodeSharePayload(encoded: string): object | null {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(encoded)
    if (!raw) return null
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object' || !Array.isArray((o as { pages?: unknown }).pages)) {
      return null
    }
    return o as object
  } catch {
    return null
  }
}

export function buildShareUrl(payload: string): string {
  const { origin, pathname, search } = window.location
  return `${origin}${pathname}${search}#share=${payload}`
}
