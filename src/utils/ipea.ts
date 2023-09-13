import { IndexValue } from "@/models/finance"

interface IpeaJsonValue {
    SERCODIGO: string // Series ID
    VALDATA: string // Date (ISO format)
    VALVALOR: Number // Value
    NIVNOME: string
    TERCODIGO: string
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
