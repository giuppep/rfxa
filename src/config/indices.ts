export type IndexId = "cdi" | "selic" | "ipca"

export type IndexProvider = "bacen" | "ipea"

interface IndexConfig {
    id: IndexId
    label: string
    provider: IndexProvider
    url: string
}

export const ECONOMIC_INDICES: IndexConfig[] = [
    {
        id: "cdi",
        label: "CDI",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?formato=json",
    },
    {
        id: "selic",
        label: "SELIC",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json",
    },
    {
        id: "ipca",
        label: "IPCA",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json",
    },
]
