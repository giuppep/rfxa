export type IndexId = "cdi" | "selic" | "ipca" | "igpm"

export type IndexProvider = "bacen" | "ipea"

export interface IndexConfig {
    id: IndexId
    label: string
    provider: IndexProvider
    url: string
    seoTitle: string
    seoDescription: string
}

export const ECONOMIC_INDICES: IndexConfig[] = [
    {
        id: "cdi",
        label: "CDI",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?formato=json",
        seoTitle: "CDI hoje e histórico - rfxa",
        seoDescription:
            "Consulte CDI mensal, acumulado em 12 meses e rendimento acumulado com dados do Banco Central do Brasil.",
    },
    {
        id: "selic",
        label: "SELIC",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json",
        seoTitle: "SELIC hoje e histórico - rfxa",
        seoDescription:
            "Acompanhe SELIC mensal, acumulada em 12 meses e rendimento acumulado com dados do Banco Central do Brasil.",
    },
    {
        id: "ipca",
        label: "IPCA",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json",
        seoTitle: "IPCA acumulado e histórico - rfxa",
        seoDescription:
            "Consulte IPCA mensal, acumulado em 12 meses e inflação acumulada com dados oficiais do Banco Central do Brasil.",
    },
    {
        id: "igpm",
        label: "IGP-M",
        provider: "bacen",
        url: "https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json",
        seoTitle: "IGP-M acumulado e histórico - rfxa",
        seoDescription:
            "Acompanhe IGP-M mensal, acumulado em 12 meses e variação acumulada com dados do Banco Central do Brasil.",
    },
]
