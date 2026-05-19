#!/usr/bin/env node
/**
 * ดึงเทมเพลตจาก Polotno API แล้วสร้าง src/data/curatedTemplates.ts
 * ใช้: npm run fetch-templates  (ต้องมี VITE_POLOTNO_KEY ใน .env)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function readKey() {
  const envPath = path.join(root, '.env')
  if (!fs.existsSync(envPath)) throw new Error('ไม่พบ .env')
  const m = fs.readFileSync(envPath, 'utf8').match(/VITE_POLOTNO_KEY=(.+)/)
  if (!m) throw new Error('ไม่พบ VITE_POLOTNO_KEY ใน .env')
  return m[1].trim()
}

const QUERIES = [
  ['ig', 'instagram post'], ['ig', 'instagram feed'], ['ig', 'instagram square'],
  ['story', 'instagram story'], ['story', 'instagram story aesthetic'],
  ['reel', 'instagram reel'], ['reel', 'tiktok vertical'],
  ['fb', 'facebook post'], ['fb', 'facebook cover'], ['fb', 'facebook ad'],
  ['youtube', 'youtube thumbnail'], ['youtube', 'youtube gaming'],
  ['tiktok', 'tiktok'], ['line', 'line official'],
  ['marketing', 'sale promotion'], ['marketing', 'discount banner'],
  ['marketing', 'flash sale'], ['marketing', 'black friday'],
  ['poster', 'poster'], ['poster', 'event poster'],
  ['flyer', 'flyer'], ['flyer', 'party flyer'],
  ['food', 'food menu'], ['food', 'restaurant'], ['food', 'cafe coffee'],
  ['beauty', 'beauty salon'], ['beauty', 'skincare cosmetics'],
  ['fitness', 'fitness gym'], ['fitness', 'yoga wellness'],
  ['wedding', 'wedding invitation'], ['wedding', 'save the date'],
  ['birthday', 'birthday party'], ['birthday', 'birthday invitation'],
  ['education', 'education course'], ['education', 'webinar school'],
  ['realestate', 'real estate'], ['realestate', 'property listing'],
  ['travel', 'travel vacation'], ['travel', 'hotel resort'],
  ['business', 'business corporate'], ['business', 'startup pitch'],
  ['presentation', 'presentation slide'], ['presentation', 'pitch deck'],
  ['christmas', 'christmas holiday'], ['christmas', 'new year party'],
  ['valentine', 'valentine love'], ['halloween', 'halloween spooky'],
  ['podcast', 'podcast cover'], ['music', 'music album cover'],
  ['ecommerce', 'ecommerce product'], ['ecommerce', 'online shop fashion'],
  ['minimal', 'minimal clean'], ['minimal', 'simple elegant'],
  ['infographic', 'infographic chart'], ['certificate', 'certificate award'],
  ['restaurant', 'restaurant menu board'], ['retail', 'retail shop sale'],
  ['tech', 'technology app'], ['finance', 'finance banking'],
  ['pet', 'pet dog cat'], ['kids', 'kids school playful'],
  ['sports', 'sports football'], ['automotive', 'car automotive'],
  ['nonprofit', 'charity donation'], ['medical', 'medical clinic health'],
  ['quote', 'motivation quote typography'], ['logo', 'logo brand identity'],
  ['magazine', 'magazine cover editorial'], ['email', 'email newsletter header'],
  ['linkedin', 'linkedin post professional'], ['pinterest', 'pinterest pin'],
  ['thai', 'thailand festival'], ['songkran', 'songkran water festival'],
]

const SECTION_MAP = {
  trending: ['ig', 'story', 'fb', 'youtube', 'marketing', 'christmas', 'minimal'],
  social: ['fb', 'youtube', 'tiktok', 'line', 'linkedin', 'pinterest', 'email'],
  'ig-pack': ['ig', 'reel'],
  stories: ['story', 'reel'],
  youtube: ['youtube', 'podcast', 'music'],
  presentation: ['presentation', 'business', 'infographic'],
  marketing: ['marketing', 'poster', 'flyer', 'ecommerce', 'retail'],
  print: ['poster', 'flyer', 'magazine', 'certificate'],
  food: ['food', 'restaurant', 'cafe'],
  retail: ['ecommerce', 'retail', 'marketing'],
  events: ['wedding', 'birthday', 'event', 'valentine', 'halloween'],
  education: ['education', 'certificate', 'kids'],
  realestate: ['realestate', 'business'],
  travel: ['travel', 'hotel'],
  fitness: ['fitness', 'sports'],
  beauty: ['beauty', 'minimal'],
  tech: ['tech', 'business', 'startup'],
  finance: ['finance', 'business'],
  minimal: ['minimal', 'quote'],
  bold: ['marketing', 'christmas', 'birthday'],
  documents: ['presentation', 'infographic', 'certificate', 'email'],
  linkedin: ['linkedin', 'business'],
  holidays: ['christmas', 'valentine', 'halloween', 'songkran', 'thai'],
  podcast: ['podcast', 'music', 'youtube'],
  nonprofit: ['nonprofit', 'charity'],
  science: ['medical', 'education'],
  kids: ['kids', 'birthday'],
  automotive: ['automotive', 'business'],
}

async function fetchPage(key, q, page, perPage = 30) {
  const url = `https://api.polotno.com/api/get-templates?size=all&query=${encodeURIComponent(q)}&per_page=${perPage}&page=${page}&KEY=${key}`
  const r = await fetch(url)
  if (!r.ok) return { items: [], totalPages: 0 }
  return r.json()
}

async function main() {
  const key = readKey()
  const seen = new Set()
  const items = []

  for (const [cat, q] of QUERIES) {
    for (let page = 1; page <= 4; page++) {
      const data = await fetchPage(key, q, page)
      const batch = data.items ?? []
      if (!batch.length) break
      for (const it of batch) {
        if (!it.json || seen.has(it.json)) continue
        seen.add(it.json)
        items.push({
          id: it.json.split('/').pop().replace('.json', ''),
          category: cat,
          preview: it.preview,
          json: it.json,
        })
      }
      if (page >= (data.totalPages || 1)) break
      await new Promise((r) => setTimeout(r, 70))
    }
    await new Promise((r) => setTimeout(r, 50))
  }

  console.log(`ดึงได้ ${items.length} เทมเพลต`)

  const lines = items
    .map(
      (i) =>
        `  { id: ${JSON.stringify(i.id)}, category: ${JSON.stringify(i.category)}, preview: ${JSON.stringify(i.preview)}, json: ${JSON.stringify(i.json)} },`,
    )
    .join('\n')

  const sectionEntries = Object.entries(SECTION_MAP)
    .map(([k, v]) => `  ${JSON.stringify(k)}: [${v.map((x) => JSON.stringify(x)).join(', ')}],`)
    .join('\n')

  const out = `/** เทมเพลตจาก Polotno CDN — สร้างด้วย npm run fetch-templates */
import type { CatalogTemplateItem } from '../types/catalogTemplate'

export type CuratedTemplate = {
  id: string
  category: string
  preview: string
  json: string
}

/** ${items.length} เทมเพลต */
export const CURATED_TEMPLATES: CuratedTemplate[] = [
${lines}
]

const BY_CATEGORY = new Map<string, CuratedTemplate[]>()
for (const t of CURATED_TEMPLATES) {
  const list = BY_CATEGORY.get(t.category) ?? []
  list.push(t)
  BY_CATEGORY.set(t.category, list)
}

export const TEMPLATE_TOTAL_COUNT = ${items.length}

export const HOME_SECTION_CURATED_CATEGORIES: Record<string, string[]> = {
${sectionEntries}
}

export function curatedAsTemplateItems(categories: string[], limit = 24): { preview: string; json: string }[] {
  const seen = new Set<string>()
  const out: { preview: string; json: string }[] = []
  for (const cat of categories) {
    for (const t of BY_CATEGORY.get(cat) ?? []) {
      if (seen.has(t.json)) continue
      seen.add(t.json)
      out.push({ preview: t.preview, json: t.json })
      if (out.length >= limit) return out
    }
  }
  for (const t of CURATED_TEMPLATES) {
    if (seen.has(t.json)) continue
    seen.add(t.json)
    out.push({ preview: t.preview, json: t.json })
    if (out.length >= limit) return out
  }
  return out
}

export function curatedAsCatalogItems(categories: string[], limit = 24): CatalogTemplateItem[] {
  return curatedAsTemplateItems(categories, limit).map((t) => ({
    ...t,
    provider: 'polotno' as const,
    providerLabel: 'Polotno',
  }))
}

export function curatedForHomeSection(sectionId: string, limit = 24): CatalogTemplateItem[] {
  const cats = HOME_SECTION_CURATED_CATEGORIES[sectionId]
  if (!cats?.length) return curatedAsCatalogItems([], limit)
  return curatedAsCatalogItems(cats, limit)
}

const FEATURED_CATEGORY_ORDER = [
  'ig', 'story', 'fb', 'youtube', 'marketing', 'food', 'wedding', 'birthday',
  'beauty', 'business', 'poster', 'flyer', 'education', 'travel', 'christmas',
  'presentation', 'podcast', 'realestate', 'fitness', 'minimal', 'tech',
  'ecommerce', 'restaurant', 'valentine', 'halloween', 'linkedin', 'email',
  'quote', 'kids', 'pet', 'sports', 'automotive', 'nonprofit', 'medical',
  'infographic', 'certificate', 'magazine', 'pinterest', 'reel', 'tiktok',
] as const

export function curatedFeaturedPicks(limit = 32): CatalogTemplateItem[] {
  const seen = new Set<string>()
  const out: CatalogTemplateItem[] = []
  let round = 0
  while (out.length < limit) {
    let added = false
    for (const cat of FEATURED_CATEGORY_ORDER) {
      const list = BY_CATEGORY.get(cat) ?? []
      const t = list[round]
      if (!t || seen.has(t.json)) continue
      seen.add(t.json)
      out.push({ provider: 'polotno', providerLabel: 'Polotno', preview: t.preview, json: t.json })
      added = true
      if (out.length >= limit) break
    }
    if (!added) break
    round++
  }
  if (out.length < limit) {
    for (const t of CURATED_TEMPLATES) {
      if (seen.has(t.json)) continue
      seen.add(t.json)
      out.push({ provider: 'polotno', providerLabel: 'Polotno', preview: t.preview, json: t.json })
      if (out.length >= limit) break
    }
  }
  return out
}

export function curatedFromCategories(
  categories: string[],
  limit: number,
  offsetRound = 0,
): CatalogTemplateItem[] {
  const seen = new Set<string>()
  const out: CatalogTemplateItem[] = []
  let round = offsetRound
  while (out.length < limit) {
    let added = false
    for (const cat of categories) {
      const list = BY_CATEGORY.get(cat) ?? []
      const t = list[round]
      if (!t || seen.has(t.json)) continue
      seen.add(t.json)
      out.push({ provider: 'polotno', providerLabel: 'Polotno', preview: t.preview, json: t.json })
      added = true
      if (out.length >= limit) break
    }
    if (!added) break
    round++
  }
  return out
}
`

  const outPath = path.join(root, 'src/data/curatedTemplates.ts')
  fs.writeFileSync(outPath, out)
  console.log('เขียนแล้ว:', outPath)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
