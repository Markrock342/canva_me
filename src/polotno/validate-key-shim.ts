/**
 * ปิด watermark บน canvas (FREE TRIAL / Powered by polotno)
 * ยัง validate API key ตามปกติเพื่อใช้ฟีเจอร์ Polotno
 */
import * as mobx from 'mobx'
import { setRemoveBackgroundEnabled } from 'polotno/config'

const POLOTNO_API = 'https://api.polotno.com/api'

const apiVersion = mobx.observable({ value: 'v1' })
export const ___ = () => apiVersion.value

/** 0 = ไม่แสดง trial badge บน canvas */
export const ____ = () => 0

/** ไม่แสดงข้อความ Powered by polotno.com */
export const isCreditVisible = () => false

let key = ''
export const getKey = () => key || ''

let origin = typeof window !== 'undefined' ? window.location.origin : ''
const isHeadless =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Headless')
const isElectron =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')
if (origin === 'file://' && isHeadless) origin = 'headless'
if (origin === 'file://' && isElectron) origin = 'electron'

const domainWarning = `%cPolotno error! Current domain is not allowed. It may lead to unexpected behavior and stop working. Please add "${origin}" here: https://polotno.com/cabinet`

let fetchImpl: typeof fetch = fetch
export const __ = (impl: typeof fetch) => {
  fetchImpl = impl
}

export async function isKeyPaid(apiKey: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetchImpl(`${POLOTNO_API}/validate-key`, {
        method: 'POST',
        body: JSON.stringify({
          key: apiKey,
          site: typeof location !== 'undefined' ? location.host : '',
          skdVersion: '2.41.1',
        }),
      })

      mobx.runInAction(() => {
        apiVersion.value = res.headers.get('x-api-version') || ''
      })

      if (!apiKey) {
        console.error(
          'Polotno API is initialized without API key. Create one at https://polotno.com/cabinet',
        )
        return false
      }

      if (res.status !== 200) {
        await new Promise((r) => setTimeout(r, 3000))
        continue
      }

      const data = await res.json()

      if (!data.is_valid) {
        console.error(
          'Polotno API key is not valid. Get a new key at https://polotno.com/cabinet',
        )
      }

      if (!data.is_domain_valid) {
        console.log(domainWarning, 'background: rgba(247, 101, 68, 1); color: white; padding: 5px; margin: 5px;')
      }

      setRemoveBackgroundEnabled(data.remove_background_enabled)
      return Boolean(data.is_paid)
    } catch {
      await new Promise((r) => setTimeout(r, 3000))
    }
  }

  console.error('Could not validate Polotno API key.')
  return true
}

export async function validateKey(apiKey: string, _showCredit?: boolean) {
  key = apiKey
  await isKeyPaid(apiKey)
}
