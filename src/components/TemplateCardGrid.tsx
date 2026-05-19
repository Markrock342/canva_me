import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { templateList } from 'polotno/utils/api'
import { useInfiniteAPI } from 'polotno/utils/use-api'
import { TEMPLATE_LIST_PER_PAGE } from '../lib/polotnoTemplateList'

export type TemplateItem = { preview: string; json: string }

/** query ส่วนท้ายเมื่อหมวดหลักว่าง — ลำดับมีความหมาย */
const DEFAULT_FALLBACK_TAIL = [
  'instagram',
  'social media',
  'facebook post',
  'poster flyer',
  'business marketing',
  'youtube thumbnail',
  'design template',
]

function buildQueryChain(primary: string, extras?: string[]): string[] {
  const raw = [primary, ...(extras ?? []), ...DEFAULT_FALLBACK_TAIL]
  const out: string[] = []
  const seen = new Set<string>()
  for (const q of raw) {
    const t = q.trim()
    if (!t || seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

function mergeTemplateItems(
  seed: TemplateItem[] | undefined,
  fromApi: TemplateItem[],
  cap: number | undefined,
  globalSeen?: Set<string>,
): TemplateItem[] {
  const localSeen = new Set<string>()
  const out: TemplateItem[] = []
  for (const item of [...(seed ?? []), ...fromApi]) {
    if (localSeen.has(item.json)) continue
    if (globalSeen?.has(item.json)) continue
    localSeen.add(item.json)
    globalSeen?.add(item.json)
    out.push(item)
    if (cap !== undefined && out.length >= cap) break
  }
  return out
}

type InnerProps = {
  query: string
  sizeQuery?: string
  onSelect: (item: TemplateItem) => void
  layout?: 'horizontal' | 'grid'
  maxItems?: number
  limitRows?: number
  prefetchPages?: number
  /** เทมเพลตคัดสรร — แสดงทันทีก่อน/คู่กับ API */
  seedItems?: TemplateItem[]
  /** แสดงข้อความเมื่อว่างจริงๆ (โมดัลเทมเพลต) */
  showEmptyMessage?: boolean
  /** หน้าแรก: ลอง query สำรองจนได้รายการ ไม่ขึ้นข้อความว่าไม่พบ */
  onSettledEmpty?: () => void
  /** หน้าแรก: กันซ้ำข้ามแถว */
  seenKeys?: Set<string>
}

const TemplateCardGridInner = observer(function TemplateCardGridInner({
  query,
  sizeQuery = 'size=all',
  onSelect,
  layout = 'horizontal',
  limitRows,
  maxItems,
  prefetchPages = 1,
  seedItems,
  showEmptyMessage = true,
  onSettledEmpty,
  seenKeys,
}: InnerProps) {
  const { setQuery, loadMore, hasMore, data, isLoading, reset, error } =
    useInfiniteAPI({
      defaultQuery: query,
      getAPI: ({ page, query: q }) =>
        templateList({ page, query: q, sizeQuery }),
      getSize: (res) => {
        const r = res as { totalPages?: number; total_pages?: number }
        const n = Number(r.totalPages ?? r.total_pages)
        return Number.isFinite(n) && n >= 1 ? n : 1
      },
    })

  const capFromRows =
    limitRows && layout === 'horizontal' ? limitRows * 4 : undefined
  const cap = maxItems ?? capFromRows

  const effectivePrefetchPages = useMemo(() => {
    if (prefetchPages <= 1) return 1
    if (layout === 'horizontal' && cap != null && cap > 0) {
      const pagesNeeded = Math.max(1, Math.ceil(cap / TEMPLATE_LIST_PER_PAGE))
      return Math.min(prefetchPages, pagesNeeded)
    }
    return prefetchPages
  }, [prefetchPages, layout, cap])

  const pagesLoaded = data?.length ?? 0

  const skipSetQueryOnMount = useRef(true)
  useEffect(() => {
    if (skipSetQueryOnMount.current) {
      skipSetQueryOnMount.current = false
      return
    }
    setQuery(query)
  }, [query, setQuery])

  const skipResetOnMount = useRef(true)
  useEffect(() => {
    if (skipResetOnMount.current) {
      skipResetOnMount.current = false
      return
    }
    reset()
  }, [sizeQuery, reset])

  useEffect(() => {
    if (effectivePrefetchPages <= 1) return
    if (error || isLoading) return
    if (pagesLoaded >= effectivePrefetchPages) return
    if (!hasMore) return
    loadMore()
  }, [effectivePrefetchPages, pagesLoaded, hasMore, isLoading, loadMore, error])

  const apiItems = (data?.map((page) => page.items).flat() ?? []) as TemplateItem[]

  const visible = useMemo(
    () => mergeTemplateItems(seedItems, apiItems, cap, seenKeys),
    [seedItems, apiItems, cap, seenKeys],
  )

  useEffect(() => {
    if (cap === undefined || layout !== 'horizontal') return
    if (error || isLoading) return
    if (!hasMore) return
    if (visible.length >= Math.min(cap, 8)) return
    loadMore()
  }, [cap, visible.length, hasMore, isLoading, loadMore, error, layout])

  const emptyNotified = useRef(false)
  useEffect(() => {
    if (!onSettledEmpty) {
      emptyNotified.current = false
      return
    }
    if (isLoading || error || visible.length > 0) {
      emptyNotified.current = false
      return
    }
    if (emptyNotified.current) return
    emptyNotified.current = true
    onSettledEmpty()
  }, [isLoading, error, visible.length, onSettledEmpty])

  const skeletonCount = Math.min(
    layout === 'horizontal' ? Math.max(6, Math.ceil((cap ?? 24) / 6)) : 12,
    14,
  )

  const skeletonRow = (
    <div className={`template-grid template-grid--${layout}`}>
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div key={`sk-${i}`} className="template-card template-card--skeleton" />
      ))}
    </div>
  )

  if (error) {
    return (
      <p className="template-grid__message">
        โหลดเทมเพลตไม่สำเร็จ — ตรวจสอบ API key ใน .env
      </p>
    )
  }

  if (!isLoading && visible.length === 0) {
    if (onSettledEmpty) {
      return skeletonRow
    }
    if (showEmptyMessage) {
      return <p className="template-grid__message">ไม่พบเทมเพลต</p>
    }
    return skeletonRow
  }

  return (
    <div className={`template-grid template-grid--${layout}`}>
      {visible.map((item, i) => (
        <button
          key={`${item.preview}-${i}`}
          type="button"
          className="template-card"
          aria-label={`เปิดเทมเพลตตัวอย่าง ${i + 1}`}
          onClick={() => onSelect(item)}
        >
          <img
            src={item.preview}
            alt=""
            loading={layout === 'horizontal' && i < 12 ? 'eager' : 'lazy'}
            decoding="async"
            width={300}
            height={168}
          />
        </button>
      ))}
      {isLoading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={`sk-${i}`} className="template-card template-card--skeleton" />
        ))}
      {hasMore && !isLoading && (
        <button type="button" className="template-grid__more" onClick={() => loadMore()}>
          โหลดเพิ่ม
        </button>
      )}
    </div>
  )
})

export type TemplateCardGridProps = InnerProps & {
  /** หน้าแรก: ลอง query สำรองจนได้รายการ ไม่ขึ้นข้อความว่าไม่พบ */
  fallbackChain?: boolean
  fallbackQueries?: string[]
}

export const TemplateCardGrid = observer(function TemplateCardGrid({
  fallbackChain = false,
  fallbackQueries,
  query,
  ...rest
}: TemplateCardGridProps) {
  const chain = useMemo(
    () => buildQueryChain(query, fallbackQueries),
    [query, fallbackQueries],
  )
  const [qi, setQi] = useState(0)
  const activeQuery = chain[Math.min(qi, chain.length - 1)] ?? query

  const tryNext = useCallback(() => {
    setQi((i) => (i < chain.length - 1 ? i + 1 : i))
  }, [chain.length])

  if (!fallbackChain) {
    return <TemplateCardGridInner {...rest} query={query} showEmptyMessage />
  }

  const hasMoreQueries = qi < chain.length - 1

  return (
    <TemplateCardGridInner
      key={activeQuery}
      {...rest}
      query={activeQuery}
      showEmptyMessage={false}
      onSettledEmpty={hasMoreQueries ? tryNext : undefined}
    />
  )
})
