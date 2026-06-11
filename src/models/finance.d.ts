export interface IndexValue {
    date: Date
    value: number
}

export interface CumulativeIndexValue {
    date: Date
    value: number
    cumulativeLast12Months: number
}
