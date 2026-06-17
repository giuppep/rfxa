export default {
    nav: {
        indices: "Indices",
    },
    home: {
        tagline:
            "Track Brazilian economic indices with month-on-month, year-on-year and cumulative changes over any period you choose.",
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
                label: "Total (selected period)",
                description:
                    "Cumulative compounded return over the selected period",
            },
            annualized: {
                label: "Annualized (selected period)",
                description:
                    "What the selected period's return would be if sustained for 12 months",
            },
            bestMonth: {
                label: "Best month (selected period)",
                description:
                    "Month with the highest month-on-month return in the selected period",
            },
            worstMonth: {
                label: "Worst month (selected period)",
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
}
