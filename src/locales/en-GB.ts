export default {
    nav: {
        indices: "Indices",
        exchange: "Exchange",
        menu: "Open navigation menu",
        calculator: "Calculator",
    },
    home: {
        tagline:
            "Track Brazilian economic indices and the official USD exchange rate from BACEN.",
        usdBrl: {
            title: "USD/BRL",
            description: "Official BACEN PTAX exchange rate.",
            latest: "Latest available sell rate",
            loading: "Loading rate...",
            unavailable: "Rate unavailable",
        },
    },
    notFound: {
        message: "This page doesn't exist.",
        backHome: "Back to home",
    },
    index: {
        cdi: {
            description:
                "Interbank lending rate, the benchmark for most fixed-income investments.",
        },
        selic: {
            description:
                "Brazil's base interest rate, set by the Central Bank's monetary policy committee.",
        },
        ipca: {
            description: "The official measure of consumer price inflation.",
        },
        igpm: {
            description:
                "General market price index, commonly used to adjust rents and contracts.",
        },
    },
    indices: {
        pageTitle: "Brazilian economic indices",
        selectIndex: "Select one index:",
        latestValues: "Latest values",
        periodAnalysis: "Period analysis",
        loading: "Loading...",
        from: "From",
        to: "To",
        series: {
            mom: "MoM",
            yoy: "YoY",
            total: "Total",
        },
        stats: {
            currentMom: {
                label: "Current MoM",
                description:
                    "Month-on-month return for the latest available month",
            },
            currentYoy: {
                label: "Current YoY",
                description:
                    "Cumulative compounded return over the last 12 months",
            },
            currentYtd: {
                label: "Current YTD",
                description:
                    "Cumulative compounded return since January 1st of the current year",
            },
            total: {
                label: "Total",
                description:
                    "Cumulative compounded return over the selected period",
            },
            annualized: {
                label: "Annualized",
                description:
                    "What the selected period's return would be if sustained for 12 months",
            },
            bestMonth: {
                label: "Best month",
                description:
                    "Month with the highest month-on-month return in the selected period",
            },
            worstMonth: {
                label: "Worst month",
                description:
                    "Month with the lowest month-on-month return in the selected period",
            },
        },
        table: {
            date: "Date",
            mom: "MoM",
            yoy: "YoY",
        },
    },
    exchange: {
        pageTitle: "USD/BRL exchange rate",
        description:
            "Official US dollar exchange rate published by the Brazilian Central Bank's PTAX service.",
        rateTypes: {
            buy: "Buy",
            sell: "Sell",
        },
        latestAvailable: "Latest available {type} rate",
        previousDayChange: "Previous day",
        thirtyDayChange: "Last 30 days",
        ninetyDayChange: "Last 90 days",
        dailyChart: "Daily exchange rate",
        chartLabel: "USD/BRL {type}",
        loading: "Loading exchange rate...",
        unavailable: "The exchange rate is unavailable right now.",
    },
    calculator: {
        pageTitle: "Returns calculator",
        investedAmount: "Invested amount",
        index: "Index",
        fixedRate: "Fixed rate",
        period: "Period",
        from: "From",
        to: "To",
        modifierType: {
            percentage: "% of index",
            spread: "Index + % p.a.",
        },
        results: {
            finalValue: "Final value",
            invested: "Invested: {amount}",
            totalReturn: "Total return",
            months: "{n} months",
            annualized: "Annualized return",
            perAnnum: "per annum",
        },
    },
}
