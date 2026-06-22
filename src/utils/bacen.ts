import { ExchangeRateValue, IndexValue } from "@/models/finance"
import { formatDate } from "./formatting"
import { cachedRequest } from "@/utils/cache"

interface BacenJsonValue {
    data: string
    valor: string
}

interface PtaxJsonValue {
    cotacaoCompra: number
    cotacaoVenda: number
    dataHoraCotacao: string
}

interface PtaxJsonResponse {
    value: PtaxJsonValue[]
}

const PTAX_USD_PERIOD_URL =
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)"

/** Converts a DD/MM/YYYY date string to a Date object */
const parseDate = (dateStr: string) => {
    const dateParts = dateStr.split("/")
    if (dateParts.length !== 3) throw `Invalid date: ${dateStr}`

    // Basically rewrite date as ISO string and parse it.
    return new Date(dateParts.reverse().join("-") + "T00:00:00-03:00")
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

const parsePtaxTimestamp = (value: string) =>
    new Date(`${value.replace(" ", "T")}-03:00`)

const serializeExchangeRates = (rates: ExchangeRateValue[]) =>
    JSON.stringify(
        rates.map((rate) => ({
            ...rate,
            date: rate.date.toISOString(),
            timestamp: rate.timestamp.toISOString(),
        }))
    )

const deserializeExchangeRates = (value: string): ExchangeRateValue[] =>
    (
        JSON.parse(value) as {
            date: string
            buy: number
            sell: number
            timestamp: string
        }[]
    ).map((rate) => ({
        ...rate,
        date: new Date(rate.date),
        timestamp: new Date(rate.timestamp),
    }))

const parsePtaxJson = (json: PtaxJsonResponse): ExchangeRateValue[] =>
    json.value
        .map((entry) => {
            const timestamp = parsePtaxTimestamp(entry.dataHoraCotacao)
            return {
                date: new Date(
                    timestamp.getFullYear(),
                    timestamp.getMonth(),
                    timestamp.getDate()
                ),
                buy: entry.cotacaoCompra,
                sell: entry.cotacaoVenda,
                timestamp,
            }
        })
        .sort((x, y) => y.timestamp.getTime() - x.timestamp.getTime())

export const bacenRequest = async (
    url: string,
    periodStart?: Date,
    periodEnd?: Date
) => {
    const requestUrl = new URL(url, window.location.origin)
    if (periodStart)
        requestUrl.searchParams.set(
            "dataInicial",
            formatDate(periodStart, "dd/mm/yyyy")
        )
    if (periodEnd)
        requestUrl.searchParams.set(
            "dataFinal",
            formatDate(periodEnd, "dd/mm/yyyy")
        )

    const response = await fetch(requestUrl)
    return parseBacenJson(await response.json())
}

export const ptaxUsdBrlRequest = async (
    periodStart: Date,
    periodEnd: Date
): Promise<ExchangeRateValue[]> => {
    const key =
        "exchange-rate:usd-brl:" +
        `${formatDate(periodStart, "iso")}:${formatDate(periodEnd, "iso")}`

    return cachedRequest({
        key,
        request: async () => {
            const requestUrl = new URL(PTAX_USD_PERIOD_URL)
            requestUrl.searchParams.set(
                "@dataInicial",
                `'${formatDate(periodStart, "mm-dd-yyyy")}'`
            )
            requestUrl.searchParams.set(
                "@dataFinalCotacao",
                `'${formatDate(periodEnd, "mm-dd-yyyy")}'`
            )
            requestUrl.searchParams.set("$format", "json")

            const response = await fetch(requestUrl)
            if (!response.ok)
                throw new Error("Failed to fetch PTAX USD/BRL rates")

            return parsePtaxJson((await response.json()) as PtaxJsonResponse)
        },
        serialize: serializeExchangeRates,
        deserialize: deserializeExchangeRates,
    })
}

export const latestPtaxUsdBrlRequest = async () => {
    const periodEnd = new Date()
    const periodStart = new Date(periodEnd)

    // Today may not have a PTAX quote yet, and weekends/holidays have no
    // quotes, so fetch a small window and use the newest returned record.
    periodStart.setDate(periodStart.getDate() - 10)

    const rates = await ptaxUsdBrlRequest(periodStart, periodEnd)
    return rates[0]
}
