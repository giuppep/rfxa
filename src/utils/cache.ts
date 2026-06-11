import { IndexValue } from "@/models/finance"
import { IndexConfig } from "@/config/indices"

interface SerializedIndexValue {
    date: string
    value: number
}

type IndexRequest = (
    url: string,
    periodStart?: Date,
    periodEnd?: Date
) => Promise<IndexValue[]>

const formatCacheDate = (date?: Date) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

const cacheKey = (index: IndexConfig, periodStart?: Date, periodEnd?: Date) =>
    `index-values:${index.id}:${index.provider}:` +
    `${formatCacheDate(periodStart)}:${formatCacheDate(periodEnd)}`

/** Wraps an index *Request helper with a sessionStorage cache keyed by
 *  index, provider and time span, so the same data isn't refetched on
 *  every navigation. */
export const cachedIndexRequest = async (
    request: IndexRequest,
    index: IndexConfig,
    periodStart?: Date,
    periodEnd?: Date
): Promise<IndexValue[]> => {
    const key = cacheKey(index, periodStart, periodEnd)

    const cached = sessionStorage.getItem(key)
    if (cached) {
        return (JSON.parse(cached) as SerializedIndexValue[]).map(
            ({ date, value }) => ({ date: new Date(date), value })
        )
    }

    const indexValues = await request(index.url, periodStart, periodEnd)
    sessionStorage.setItem(key, JSON.stringify(indexValues))
    return indexValues
}
