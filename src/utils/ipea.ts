import { IndexValue } from "@/models/finance"

interface IpeaJsonValue {
    SERCODIGO: string // Series ID
    VALDATA: string // Date (ISO format)
    VALVALOR: number // Value
    NIVNOME: string
    TERCODIGO: string
}

interface IpeaJsonResponse {
    value: IpeaJsonValue[]
}

export const parseIpeaJson = (ipeaJson: IpeaJsonValue[]) => {
    return ipeaJson
        .map((ipeaJsonValue) => {
            const date = new Date(ipeaJsonValue.VALDATA)
            // FIXME: this can cause rounding errors
            const value = Number(ipeaJsonValue.VALVALOR) / 100

            return { date, value } as IndexValue
        })
        .sort((x, y) => y.date.getTime() - x.date.getTime())
}

// IPEA's ValoresSerie endpoint (http://www.ipeadata.gov.br/api/) doesn't
// support $filter/$top, so it always returns the full history of the
// series. periodStart/periodEnd are therefore applied client-side.
export const ipeaRequest = async (
    url: string,
    periodStart?: Date,
    periodEnd?: Date
) => {
    const response = await fetch(url)
    const { value } = (await response.json()) as IpeaJsonResponse

    return parseIpeaJson(value).filter(
        (indexValue) =>
            (!periodStart || indexValue.date >= periodStart) &&
            (!periodEnd || indexValue.date <= periodEnd)
    )
}
