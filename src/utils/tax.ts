const DAY_IN_MS = 24 * 60 * 60 * 1000

const IOF_RATES = [
    0,
    0.96,
    0.93,
    0.9,
    0.86,
    0.83,
    0.8,
    0.76,
    0.73,
    0.7,
    0.66,
    0.63,
    0.6,
    0.56,
    0.53,
    0.5,
    0.46,
    0.43,
    0.4,
    0.36,
    0.33,
    0.3,
    0.26,
    0.23,
    0.2,
    0.16,
    0.13,
    0.1,
    0.06,
    0.03,
]

export interface FixedIncomeTaxBreakdown {
    days: number
    grossIncome: number
    iofRate: number
    iof: number
    irRate: number
    ir: number
    netIncome: number
    netValue: number
}

export const daysBetween = (start: Date, end: Date) =>
    Math.max(0, Math.floor((end.valueOf() - start.valueOf()) / DAY_IN_MS))

export const fixedIncomeIofRate = (days: number) =>
    days > 0 && days < IOF_RATES.length ? IOF_RATES[days] : 0

export const fixedIncomeIrRate = (days: number) => {
    if (days <= 180) return 0.225
    if (days <= 360) return 0.2
    if (days <= 720) return 0.175
    return 0.15
}

export const computeFixedIncomeTax = (
    principal: number,
    grossValue: number,
    start: Date,
    end: Date
): FixedIncomeTaxBreakdown => {
    const days = daysBetween(start, end)
    const grossIncome = Math.max(0, grossValue - principal)
    const iofRate = fixedIncomeIofRate(days)
    const iof = grossIncome * iofRate
    const irRate = fixedIncomeIrRate(days)
    // For taxable fixed-income redemptions, IOF is deducted from positive
    // income first; IR is then applied to the remaining income.
    const ir = (grossIncome - iof) * irRate
    const netIncome = grossIncome - iof - ir

    return {
        days,
        grossIncome,
        iofRate,
        iof,
        irRate,
        ir,
        netIncome,
        netValue: principal + netIncome,
    }
}
