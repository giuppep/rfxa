import { ExchangeRateValue } from "@/models/finance"

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

const formatPtaxDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${month}-${day}-${date.getFullYear()}`
}

const formatCacheDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
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

export const ptaxUsdBrlRequest = async (
    periodStart: Date,
    periodEnd: Date
): Promise<ExchangeRateValue[]> => {
    const key =
        "exchange-rate:usd-brl:" +
        `${formatCacheDate(periodStart)}:${formatCacheDate(periodEnd)}`

    const cached = sessionStorage.getItem(key)
    if (cached) return deserializeExchangeRates(cached)

    const requestUrl = new URL(PTAX_USD_PERIOD_URL)
    requestUrl.searchParams.set("@dataInicial", `'${formatPtaxDate(periodStart)}'`)
    requestUrl.searchParams.set(
        "@dataFinalCotacao",
        `'${formatPtaxDate(periodEnd)}'`
    )
    requestUrl.searchParams.set("$format", "json")

    const response = await fetch(requestUrl)
    if (!response.ok) throw new Error("Failed to fetch PTAX USD/BRL rates")

    const rates = parsePtaxJson((await response.json()) as PtaxJsonResponse)
    sessionStorage.setItem(key, serializeExchangeRates(rates))
    return rates
}

export const latestPtaxUsdBrlRequest = async () => {
    const periodEnd = new Date()
    const periodStart = new Date(periodEnd)
    periodStart.setDate(periodStart.getDate() - 10)

    const rates = await ptaxUsdBrlRequest(periodStart, periodEnd)
    return rates[0]
}
