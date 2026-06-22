export const cssVarForChart = (name: string) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim()
