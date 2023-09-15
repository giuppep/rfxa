import { IndexValue, CumulativeIndexValue } from "@/models/finance"

/** Given a time series of interest rates, it computes the cumulative interest over the
 *  whole period.
 */
const computeCumulativeInterest = (indexValues: IndexValue[]) => {
    const interest = indexValues.reduce(
        (cumulativeInterest, indexValue) =>
            cumulativeInterest * (1 + indexValue.value),
        1
    )

    return interest - 1
}

export const computeCumulativeIndexValues = (indexValues: IndexValue[]) => {
    return indexValues.map((indexValue, idx, arr) => {
        return {
            date: indexValue.date,
            value: indexValue.value,
            cumulativeSinceYearStart: computeCumulativeInterest(
                arr.filter(
                    (iv) =>
                        iv.date.getFullYear() ===
                            indexValue.date.getFullYear() &&
                        iv.date.getMonth() <= indexValue.date.getMonth()
                )
            ),
            // FIXME: assumes input sorted in descending order
            cumulativeLast12Monhts: computeCumulativeInterest(
                arr.slice(idx, idx + 12)
            ),
        } as CumulativeIndexValue
    })
}
