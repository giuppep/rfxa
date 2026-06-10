import { IndexValue } from "@/models/finance"

interface BacenJsonValue {
    data: string
    valor: string
}

/** Converts a DD/MM/YYYY date string to a Date object */
const parseDate = (dateStr: string) => {
    const dateParts = dateStr.split("/")
    if (dateParts.length !== 3) throw `Invalid date: ${dateStr}`

    // Basically rewrite date as ISO string and parse it.
    return new Date(dateParts.reverse().join("-") + "T00:00:00-03:00")
}

/** Converts a Date object to a DD/MM/YYYY date string */
const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${day}/${month}/${date.getFullYear()}`
}

export const parseBacenJson = (bacenJson: BacenJsonValue[]) => {
    return bacenJson
        .map((bv) => {
            const date = parseDate(bv.data)
            // FIXME: this can cause rounding errors
            const value = Number(bv.valor) / 100

            return { date, value } as IndexValue
        })
        .sort((x, y) => y.date.getTime() - x.date.getTime())
}

export const bacenRequest = async (
    url: string,
    periodStart?: Date,
    periodEnd?: Date
) => {
    const requestUrl = new URL(url, window.location.origin)
    if (periodStart)
        requestUrl.searchParams.set("dataInicial", formatDate(periodStart))
    if (periodEnd)
        requestUrl.searchParams.set("dataFinal", formatDate(periodEnd))

    const response = await fetch(requestUrl)
    return parseBacenJson(await response.json())
}
