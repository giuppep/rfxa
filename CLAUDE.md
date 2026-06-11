# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run tsc` (or `npx vue-tsc --noEmit`) — type-check the project; run this after any change to `.vue`/`.ts` files
- `npm run build` — type-check then production build
- `npm run preview` — preview the production build

There is no test suite or linter configured.

## Architecture

This is a Vue 3 + TypeScript + Vite + Tailwind app that displays Brazilian
economic indices (CDI, SELIC, IPCA) as a table and chart. Path alias `@/*`
maps to `./src/*`.

### Data flow

1. `src/config/indices.ts` defines `ECONOMIC_INDICES`: a list of
   `{ id: IndexId, label, provider, url }` mapping each index (`"cdi" |
   "selic" | "ipca"`) to a source URL and a `provider` (`"bacen" | "ipea"`)
   that determines which `*Request` helper fetches it.
2. `src/views/IndicesView.vue` is rendered at `/indices/:type` (`type` is an
   `IndexId` passed via route props). On change it:
   - computes the displayed period as the trailing 12 months,
   - picks `bacenRequest` or `ipeaRequest` based on `index.provider` and
     fetches an extra 12 months *before* the displayed period (24 months
     total), because YoY needs a trailing 12-month window for every
     displayed point,
   - runs `computeCumulativeIndexValues` over the full 24-month series, then
     filters back down to the displayed 12-month range.
3. The result (`CumulativeIndexValue[]`) is passed to `IndexTable` and
   `IndexLineChart`.

### Source helpers (`src/utils/`)

- `bacen.ts` (`bacenRequest`) — queries BACEN's SGS API
  (`https://api.bcb.gov.br/dados/serie/bcdata.sgs.<code>/dados?formato=json`),
  passing `dataInicial`/`dataFinal` (DD/MM/YYYY) query params.
- `ipea.ts` (`ipeaRequest`) — queries IPEA's Ipeadata OData4 API
  (`ValoresSerie(SERCODIGO='...')`). This endpoint doesn't support
  `$filter`/`$top` and always returns the full series history, so
  `periodStart`/`periodEnd` are applied client-side after fetching.

Both helpers share the signature `(url, periodStart?, periodEnd?) =>
Promise<IndexValue[]>` and return results **sorted descending by date**
(newest first) — this ordering is required by `computeCumulativeIndexValues`.

`public/cdi.json` and `public/cdi-ipea.json` are static fixtures (raw
BACEN/IPEA response shapes) downloaded to avoid hitting the live APIs during
development.

### Models and cumulative calculations (`src/models/finance.d.ts`,
`src/utils/finance.ts`)

- `IndexValue { date: Date; value: number }` — `value` is a fractional rate
  (e.g. `0.0146` for 1.46%).
- `CumulativeIndexValue` extends it with `cumulativeSinceYearStart` (YTD) and
  `cumulativeLast12Months` (YoY).
- `computeCumulativeIndexValues` assumes its input is sorted **descending** by
  date; `cumulativeLast12Months` is computed via `arr.slice(idx, idx + 12)`,
  which relies on that ordering to get the trailing 12 months.

### Chart (`src/components/IndexLineChart.vue`)

Built with Chart.js (`vue-chartjs`) + `chartjs-adapter-date-fns` for the time
scale. Displays **one series at a time** via the `series: "value" | "ytd" |
"yoy"` prop (selected in `IndicesView.vue`). The x-axis range is derived from
the actual data (`indexValues[0]`/`indexValues[last]`, since data is
descending) rather than `periodStart`/`periodEnd`, except for `"ytd"` which
always starts from January 1st of `periodEnd`'s year.

### Routing

`src/router/index.ts`: `/indices` redirects to `/indices/cdi`; `/indices/:type`
renders `IndicesView` with `type` as a prop. The index selector lives inside
`IndicesView.vue` (as `RouterLink`s), not in `NavBar`, which is reserved for
top-level navigation.

## Conventions

- No semicolons, double quotes, 4-space indentation, 80-column print width
  (enforced by Prettier — see `.prettierrc.json`).
- Avoid bundling related values into tuple/wrapper types (e.g. a
  `DateRange` tuple); prefer separate named props/params (e.g. `periodStart`
  and `periodEnd`).
