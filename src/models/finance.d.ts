export interface IndexValue {
    date: Date
    value: number
}

export interface CumulativeIndexValue {
    date: Date
    value: number
    cumulativeSinceYearStart: number
    cumulativeLast12Monhts: number
}
