const formatDatePart = (value: number) => String(value).padStart(2, "0")

export const formatDate = (
    date?: Date,
    fmt: "iso" | "dd/mm/yyyy" | "mm-dd-yyyy" = "iso"
) => {
    if (!date) return ""
    const day = formatDatePart(date.getDate())
    const month = formatDatePart(date.getMonth() + 1)
    if (fmt === "dd/mm/yyyy") return `${day}/${month}/${date.getFullYear()}`
    else if (fmt === "mm-dd-yyyy")
        return `${month}-${day}-${date.getFullYear()}`
    return `${day}-${month}-${date.getFullYear()}`
}

export const formatCurrency = (value: number, locale: string = "en-GB") => {
    const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    })
    return formatter.format(value)
}
