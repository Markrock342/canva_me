import { useEffect, useState, type ChangeEvent } from 'react'
import { observer } from 'mobx-react-lite'
import { ImagesGrid } from 'polotno/side-panel'
import { templateList } from 'polotno/utils/api'
import { useInfiniteAPI } from 'polotno/utils/use-api'
import { t } from 'polotno/utils/l10n'
import type { StoreType } from 'polotno/model/store'
import { TEMPLATE_CATEGORIES } from '../data/templateCategories'
import { loadTemplateIntoStore } from '../lib/loadTemplate'

type TemplateItem = { preview: string; json: string }

const TemplateGrid = observer(function TemplateGrid({
  store,
  sizeQuery,
  query,
}: {
  store: StoreType
  sizeQuery: string
  query: string
}) {
  const { setQuery, loadMore, hasMore, data, isLoading, reset, error } =
    useInfiniteAPI({
      defaultQuery: query,
      getAPI: ({ page, query: q }) =>
        templateList({ page, query: q, sizeQuery }),
      getSize: (res) => res.totalPages,
    })

  useEffect(() => {
    setQuery(query)
  }, [query, setQuery])

  useEffect(() => {
    reset()
  }, [sizeQuery, reset])

  const pagesLoaded = data?.length ?? 0

  /** โหลดหลายหน้าให้แผงเทมเพลตใน Studio มีตัวอย่างเยอะขึ้น */
  useEffect(() => {
    const want = 6
    if (error || isLoading) return
    if (pagesLoaded < 1) return
    if (pagesLoaded >= want || !hasMore) return
    loadMore()
  }, [pagesLoaded, hasMore, isLoading, loadMore, error])

  const images = data?.map((page) => page.items).flat() as TemplateItem[] | undefined

  return (
    <ImagesGrid
      images={images}
      getPreview={(item) => item.preview}
      isLoading={isLoading}
      onSelect={async (item) => {
        await loadTemplateIntoStore(store, item)
      }}
      loadMore={hasMore ? loadMore : undefined}
      error={error}
    />
  )
})

export const CanvameTemplatesPanel = observer(function CanvameTemplatesPanel({
  store,
}: {
  store: StoreType
}) {
  const [sameSizeOnly, setSameSizeOnly] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')

  const category =
    TEMPLATE_CATEGORIES.find((c) => c.id === categoryId) ?? TEMPLATE_CATEGORIES[0]

  const sizeQuery = sameSizeOnly
    ? `size=${store.width}x${store.height}`
    : 'size=all'

  const combinedQuery = [category.query, search].filter(Boolean).join(' ').trim()

  const applyCategorySize = (cat: (typeof TEMPLATE_CATEGORIES)[number]) => {
    if (cat.width && cat.height) {
      store.setSize(cat.width, cat.height)
    }
  }

  return (
    <div className="canvame-templates-panel">
      <div className="canvame-templates-categories" role="tablist">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={categoryId === cat.id}
            className={`canvame-templates-cat${categoryId === cat.id ? ' canvame-templates-cat--active' : ''}`}
            onClick={() => {
              setCategoryId(cat.id)
              applyCategorySize(cat)
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="canvame-templates-search bp5-input-group">
        <span className="canvame-templates-search__icon" aria-hidden>
          ⌕
        </span>
        <input
          className="bp5-input canvame-templates-search__input"
          type="search"
          placeholder={t('sidePanel.searchPlaceholder')}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      <label className="canvame-templates-switch">
        <span className="canvame-templates-switch__label">
          {t('sidePanel.searchTemplatesWithSameSize')}
        </span>
        <input
          type="checkbox"
          checked={sameSizeOnly}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSameSizeOnly(e.target.checked)
          }
        />
      </label>

      <div className="canvame-templates-grid">
        <TemplateGrid
          key={`${categoryId}-${sizeQuery}`}
          store={store}
          sizeQuery={sizeQuery}
          query={combinedQuery}
        />
      </div>
    </div>
  )
})
