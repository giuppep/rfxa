export type IndexId = "cdi" | "selic" | "ipca" | "igpm"

export type IndexProvider = "bacen" | "ipea"

export interface IndexConfig {
    id: IndexId
    label: string
    description: string
    provider: IndexProvider
    url: string
}

export const ECONOMIC_INDICES: IndexConfig[] = [
    {
        id: "cdi",
        label: "CDI",
        description:
            "Interbank lending rate, the benchmark for most fixed-income investments.",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?formato=json",
    },
    {
        id: "selic",
        label: "SELIC",
        description:
            "Brazil's base interest rate, set by the Central Bank's monetary policy committee.",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json",
    },
    {
        id: "ipca",
        label: "IPCA",
        description: "The official measure of consumer price inflation.",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json",
    },
    {
        id: "igpm",
        label: "IGP-M",
        description:
            "General market price index, commonly used to adjust rents and contracts.",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json",
    },
]
