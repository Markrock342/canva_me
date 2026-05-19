import type { CatalogTemplateItem } from '../types/catalogTemplate'

export function catalogTemplateKey(item: CatalogTemplateItem): string {
  if (item.json) return item.json
  if (item.unsplashId) return `unsplash:${item.unsplashId}`
  if (item.inlineDesign) return `local:${item.title ?? item.preview.slice(0, 40)}`
  return item.preview
}

export function filterUnseenCatalogItems(
  items: CatalogTemplateItem[],
  seen: Set<string>,
  limit?: number,
): CatalogTemplateItem[] {
  const out: CatalogTemplateItem[] = []
  for (const item of items) {
    const key = catalogTemplateKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
    if (limit !== undefined && out.length >= limit) break
  }
  return out
}

export function filterUnseenTemplateItems(
  items: { preview: string; json: string }[],
  seen: Set<string>,
  limit?: number,
): { preview: string; json: string }[] {
  const out: { preview: string; json: string }[] = []
  for (const item of items) {
    if (seen.has(item.json)) continue
    seen.add(item.json)
    out.push(item)
    if (limit !== undefined && out.length >= limit) break
  }
  return out
}
