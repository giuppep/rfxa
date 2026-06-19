import { IndexValue } from "@/models/finance"
import { IndexConfig } from "@/config/indices"
import { formatDate } from "@/utils/formatting"

interface SerializedIndexValue {
    date: string
    value: number
}

type IndexRequest = (
    url: string,
    periodStart?: Date,
    periodEnd?: Date
) => Promise<IndexValue[]>

const cacheKey = (index: IndexConfig, periodStart?: Date, periodEnd?: Date) =>
    `index-values:${index.id}:${index.provider}:` +
    `${formatDate(periodStart)}:${formatDate(periodEnd)}`

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
