export interface IndexValue {
    date: Date
    value: number
}

export interface CumulativeIndexValue {
    date: Date
    value: number
    cumulativeLast12Months: number
}

export interface ExchangeRateValue {
    date: Date
    buy: number
    sell: number
    timestamp: Date
}

export type ExchangeRateType = "buy" | "sell"
