import { useMemo } from 'react'
import type { CatalogTemplateItem } from '../types/catalogTemplate'
import { filterUnseenCatalogItems } from '../lib/homeTemplateDedup'

type Props = {
  items: CatalogTemplateItem[]
  maxItems?: number
  seenKeys: Set<string>
  onSelect: (item: CatalogTemplateItem) => void
}

/** แถวเทมเพลตคัดสรร — หลาย provider โหลดทันที */
export function CuratedTemplateGrid({ items, maxItems, seenKeys, onSelect }: Props) {
  const visible = useMemo(
    () => filterUnseenCatalogItems(items, seenKeys, maxItems),
    [items, maxItems, seenKeys],
  )

  if (visible.length === 0) {
    return null
  }

  return (
    <div className="template-grid template-grid--horizontal">
      {visible.map((item, i) => (
        <button
          key={`${item.json ?? item.unsplashId ?? item.title}-${i}`}
          type="button"
          className="template-card"
          aria-label={item.title ?? `เทมเพลต ${i + 1}`}
          onClick={() => onSelect(item)}
        >
          <img
            src={item.preview}
            alt=""
            loading={i < 12 ? 'eager' : 'lazy'}
            decoding="async"
            width={300}
            height={168}
          />
          {item.provider !== 'polotno' ? (
            <span className="template-card__provider">{item.providerLabel}</span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
