# rfxa

A small Vue 3 + TypeScript + Vite app for tracking Brazilian economic
indices — CDI, SELIC, IPCA and IGP-M — fetched from the BACEN and IPEA APIs.

For each index, the app shows:

- a table and chart of month-on-month (MoM) and year-on-year (YoY) values
  over a selectable date range,
- the cumulative growth of an investment over that range, as both a chart
  series and a summary stat,
- current MoM, YoY and YTD figures for the latest available month.

## Getting started

```sh
npm install
npm run dev
```

## Commands

- `npm run dev` — start the Vite dev server
- `npm run tsc` (or `npx vue-tsc --noEmit`) — type-check the project
- `npm run build` — type-check then production build
- `npm run preview` — preview the production build

See [CLAUDE.md](./CLAUDE.md) for an overview of the app's architecture and
data flow.
