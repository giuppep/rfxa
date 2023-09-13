import { IndexValue } from "@/models/finance"

/** Given a time series of interest rates, it computes the cumulative interest over the
 *  whole period.
 */

export const computeCumulativeInterest = (timeSeries: IndexValue[]) => {
    const interest = timeSeries.reduce(
        (cumulativeInterest, indexValue) =>
            cumulativeInterest * (1 + indexValue.value),
        1
    )

    return interest - 1
}

// TODO: this is temporary and assumes that timeSeries is sorted in descending order
export const cumulativeLast12Months = (timeSeries: IndexValue[]) =>
    timeSeries.map((_, idx, arr) =>
        computeCumulativeInterest(arr.slice(idx, idx + 12))
    )
