export default {
    nav: {
        indices: "Índices",
        exchange: "Câmbio",
    },
    home: {
        tagline:
            "Acompanhe os principais índices econômicos brasileiros e a cotação oficial do dólar pelo BACEN.",
        usdBrl: {
            title: "USD/BRL",
            description: "Cotação oficial PTAX do BACEN.",
            latest: "Última cotação de venda disponível",
            loading: "Carregando cotação...",
            unavailable: "Cotação indisponível",
        },
    },
    notFound: {
        message: "Esta página não existe.",
        backHome: "Voltar para a página inicial",
    },
    index: {
        cdi: {
            description:
                "Taxa de empréstimos interbancários, referência para a maioria dos investimentos de renda fixa.",
        },
        selic: {
            description:
                "Taxa básica de juros do Brasil, definida pelo Comitê de Política Monetária do Banco Central.",
        },
        ipca: {
            description: "Medida oficial da inflação ao consumidor.",
        },
        igpm: {
            description:
                "Índice geral de preços de mercado, amplamente utilizado para reajuste de aluguéis e contratos.",
        },
    },
    indices: {
        pageTitle: "Índices econômicos brasileiros",
        selectIndex: "Selecione um índice:",
        latestValues: "Valores atuais",
        periodAnalysis: "Análise de período",
        loading: "Carregando...",
        from: "De",
        to: "Até",
        series: {
            mom: "Mensal",
            yoy: "Anual",
            total: "Total",
        },
        stats: {
            currentMom: {
                label: "Variação mensal",
                description:
                    "Variação mensal do último mês com dados disponíveis",
            },
            currentYoy: {
                label: "Variação anual",
                description: "Retorno acumulado composto nos últimos 12 meses",
            },
            currentYtd: {
                label: "Acumulado no ano",
                description:
                    "Retorno acumulado desde 1º de janeiro do ano corrente",
            },
            total: {
                label: "Total",
                description:
                    "Retorno acumulado composto no período selecionado",
            },
            annualized: {
                label: "Anualizado",
                description:
                    "O retorno do período selecionado projetado para 12 meses",
            },
            bestMonth: {
                label: "Melhor mês",
                description:
                    "Mês com a maior variação mensal no período selecionado",
            },
            worstMonth: {
                label: "Pior mês",
                description:
                    "Mês com a menor variação mensal no período selecionado",
            },
        },
        table: {
            date: "Data",
            mom: "Mensal",
            yoy: "Anual",
        },
    },
    exchange: {
        pageTitle: "Cotação USD/BRL",
        description:
            "Cotação oficial do dólar dos Estados Unidos publicada pelo serviço PTAX do Banco Central do Brasil.",
        rateTypes: {
            buy: "Compra",
            sell: "Venda",
        },
        latestAvailable: "Última cotação de {type} disponível",
        previousDayChange: "Dia anterior",
        thirtyDayChange: "Últimos 30 dias",
        ninetyDayChange: "Últimos 90 dias",
        dailyChart: "Cotação diária",
        chartLabel: "USD/BRL {type}",
        loading: "Carregando cotação...",
        unavailable: "A cotação está indisponível no momento.",
    },
}
