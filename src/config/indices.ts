export type IndexId = "cdi" | "selic" | "ipca"

interface IndexConfig {
    id: IndexId
    label: string
    url: string
}

export const ECONOMIC_INDICES: IndexConfig[] = [
    { id: "cdi", label: "CDI", url: "/cdi.json" },
    {
        id: "selic",
        label: "SELIC",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json",
    },
    {
        id: "ipca",
        label: "IPCA",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json",
    },
]
