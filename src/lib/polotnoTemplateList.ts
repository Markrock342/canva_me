import { setAPI, getAPI } from 'polotno/utils/api'
import { getKey } from 'polotno/utils/validate-key'

/** Polotno SDK default is 30; API accepts larger batches (tested up to 200). */
export const TEMPLATE_LIST_PER_PAGE = 200

/** Replace get-templates URL so every `templateList()` call uses a bigger page size. */
export function configurePolotnoTemplateListPerPage(perPage = TEMPLATE_LIST_PER_PAGE) {
  setAPI(
    'templateList',
    ({
      query,
      page = 1,
      sizeQuery,
    }: {
      query: string
      page?: number
      sizeQuery: string
    }) =>
      `${getAPI()}/get-templates?${sizeQuery}&query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&KEY=${getKey()}`,
  )
}
