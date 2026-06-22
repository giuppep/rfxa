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

interface CachedRequestOptions<T> {
    key: string
    request: () => Promise<T[]>
    serialize?: (values: T[]) => string
    deserialize?: (value: string) => T[]
}

const cacheKey = (index: IndexConfig, periodStart?: Date, periodEnd?: Date) =>
    `index-values:${index.id}:${index.provider}:` +
    `${formatDate(periodStart)}:${formatDate(periodEnd)}`

export const cachedRequest = async <T>({
    key,
    request,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
}: CachedRequestOptions<T>): Promise<T[]> => {
    const cached = sessionStorage.getItem(key)
    if (cached) return deserialize(cached)

    const values = await request()
    sessionStorage.setItem(key, serialize(values))
    return values
}

/** Wraps an index *Request helper with a sessionStorage cache keyed by
 *  index, provider and time span, so the same data isn't refetched on
 *  every navigation. */
export const cachedIndexRequest = async (
    request: IndexRequest,
    index: IndexConfig,
    periodStart?: Date,
    periodEnd?: Date
): Promise<IndexValue[]> => {
    return cachedRequest({
        key: cacheKey(index, periodStart, periodEnd),
        request: () => request(index.url, periodStart, periodEnd),
        deserialize: (value) =>
            (JSON.parse(value) as SerializedIndexValue[]).map(
                ({ date, value }) => ({ date: new Date(date), value })
            ),
    })
}
