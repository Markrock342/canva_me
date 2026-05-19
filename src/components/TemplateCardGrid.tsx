import { useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { templateList } from 'polotno/utils/api'
import { useInfiniteAPI } from 'polotno/utils/use-api'
import { TEMPLATE_LIST_PER_PAGE } from '../lib/polotnoTemplateList'

export type TemplateItem = { preview: string; json: string }

type Props = {
  query: string
  sizeQuery?: string
  onSelect: (item: TemplateItem) => void
  layout?: 'horizontal' | 'grid'
  /** แนวนอน: จำกัดจำนวนการ์ด (ถ้าไม่ใส่ maxItems จะใช้ limitRows × 4) */
  maxItems?: number
  /** แนวนอน: จำนวนแถว × 4 การ์ด (ใช้เมื่อไม่มี maxItems) */
  limitRows?: number
  /** โหลดหลายหน้า API ล่วงหน้า (ค่าเริ่มต้น 1 = โหลดแค่หน้าแรก) */
  prefetchPages?: number
}

export const TemplateCardGrid = observer(function TemplateCardGrid({
  query,
  sizeQuery = 'size=all',
  onSelect,
  layout = 'horizontal',
  limitRows,
  maxItems,
  prefetchPages = 1,
}: Props) {
  const { setQuery, loadMore, hasMore, data, isLoading, reset, error } =
    useInfiniteAPI({
      defaultQuery: query,
      getAPI: ({ page, query: q }) =>
        templateList({ page, query: q, sizeQuery }),
      getSize: (res) => res.totalPages,
    })

  const capFromRows =
    limitRows && layout === 'horizontal' ? limitRows * 4 : undefined
  const cap = maxItems ?? capFromRows

  /** แนวนอน + มี cap: อย่า prefetch เกินจำนวนหน้าที่ต้องใช้จริง (ลด request ซ้ำทั้งหน้า) */
  const effectivePrefetchPages = useMemo(() => {
    if (prefetchPages <= 1) return 1
    if (layout === 'horizontal' && cap != null && cap > 0) {
      const pagesNeeded = Math.max(1, Math.ceil(cap / TEMPLATE_LIST_PER_PAGE))
      return Math.min(prefetchPages, pagesNeeded)
    }
    return prefetchPages
  }, [prefetchPages, layout, cap])

  const pagesLoaded = data?.length ?? 0

  useEffect(() => {
    setQuery(query)
  }, [query, setQuery])

  useEffect(() => {
    reset()
  }, [sizeQuery, reset])

  /** ดึงหลายหน้าล่วงหน้า (กริด / โมดัล ใช้ค่า prefetch สูงได้) */
  useEffect(() => {
    if (effectivePrefetchPages <= 1) return
    if (error || isLoading) return
    if (pagesLoaded >= effectivePrefetchPages) return
    if (!hasMore) return
    loadMore()
  }, [effectivePrefetchPages, pagesLoaded, hasMore, isLoading, loadMore, error])

  const items = (data?.map((page) => page.items).flat() ?? []) as TemplateItem[]

  const visible = cap !== undefined ? items.slice(0, cap) : items

  /** ถ้ายังไม่ถึง cap แต่มีหน้าถัดไป — ดึงต่อจนได้พอหรือหมด */
  useEffect(() => {
    if (cap === undefined || layout !== 'horizontal') return
    if (error || isLoading) return
    if (!hasMore) return
    if (items.length >= cap) return
    loadMore()
  }, [cap, items.length, hasMore, isLoading, loadMore, error, layout])

  if (error) {
    return (
      <p className="template-grid__message">
        โหลดเทมเพลตไม่สำเร็จ — ตรวจสอบ API key ใน .env
      </p>
    )
  }

  if (!isLoading && visible.length === 0) {
    return <p className="template-grid__message">ไม่พบเทมเพลต</p>
  }

  return (
    <div className={`template-grid template-grid--${layout}`}>
      {visible.map((item, i) => (
        <button
          key={`${item.preview}-${i}`}
          type="button"
          className="template-card"
          onClick={() => onSelect(item)}
        >
          <img
            src={item.preview}
            alt=""
            loading="lazy"
            decoding="async"
            width={300}
            height={168}
          />
        </button>
      ))}
      {isLoading &&
        Array.from({
          length: Math.min(
            layout === 'horizontal' ? Math.max(6, Math.ceil((cap ?? 24) / 6)) : 12,
            14,
          ),
        }).map((_, i) => (
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
