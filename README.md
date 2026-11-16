# PC Build Companion

> A simple tool for retrieving scores and prices for CPUs, GPUs, SSDs, and HDDs!

PC Build Companion helps you pick the parts for your next PC. It pulls benchmark data from [PassMark](https://www.passmark.com/), keeps only the components that match your filters, looks up their current prices on the [idealo](https://www.idealo.de/) price comparison site, and ranks them by value for money — so you can see at a glance which parts give you the most performance (or storage) per euro.

## Features

- **Four component types** — CPUs, GPUs, SSDs and HDDs, each with its own filters and each individually switchable.
- **Flexible filters** — year, category, socket, VRAM, capacity and benchmark score ranges, plus sorting and a per-type limit.
- **Five idealo regions** — Germany, France, Austria, Italy and Spain.
- **AI-assisted product matching** — a local LLM served by [Ollama](https://ollama.com/) decides which shop listings actually correspond to a benchmarked component. Prefer to stay in control? Turn it off and pick the listings yourself from an interactive checklist.
- **Value ranking** — every priced product gets a score-to-price ratio, and results are sorted best value first.
- **Multiple output formats** — JSON, CSV and plain text.
- **Polite crawling** — one request at a time, with a configurable requests-per-minute cap.

## How it works

1. **Benchmarks** — the PassMark charts are loaded for every enabled component type ([cpubenchmark.net](https://www.cpubenchmark.net/), [videocardbenchmark.net](https://www.videocardbenchmark.net/), [harddrivebenchmark.net](https://www.harddrivebenchmark.net/)).
2. **Filter** — your filters are applied, the remaining entries are sorted, and only the first `limit` entries are kept.
3. **Search** — each remaining component is searched on idealo; only suggestions that are product pages in the right category (processors, graphics cards, SSDs or hard drives) are considered.
4. **Match** — the suggestions that really are the component are selected, either by an Ollama model or by you (see [Product matching](#product-matching)).
5. **Price** — each matched product page is opened and its best total price (shipping included) is read.
6. **Report** — the score-to-price ratio is computed and the results are written to the output directory (see [Output](#output)).

## Requirements

- **[Node.js](https://nodejs.org/)** with npm. The dependencies require Node.js `^22.22.2`, `^24.15.0` or `>=26.0.0`.
- **[Ollama](https://ollama.com/)** (optional) — only needed for automatic product matching. The model you configure must be available on the Ollama server (`ollama pull <model>`).

## Installation

```bash
git clone https://github.com/KinokoF/pc-build-companion.git
cd pc-build-companion
npm install
```

`npm install` also downloads the Playwright browsers used by the crawler (via a `postinstall` script), so the first install can take a little while.

## Usage

> **Before your first run** — the bundled `config.json` has automatic product matching switched on (`ollama.enable` is `true`). Either make sure an Ollama server is running and the configured model is available on it, or set `ollama.enable` to `false` to select the products yourself. Otherwise the matching step fails for every component and no results are written.

1. Adjust [`config.json`](config.json) to your needs (see [Configuration](#configuration)).
2. Run the tool:

   ```bash
   npm start
   ```

At startup the tool prints the settings and the search filter it is going to use, then logs its progress while it works. When it finishes, the results are in the directory set in `out.dir` (`out/` in the bundled `config.json`).

### Commands

| Command              | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `npm start`          | Runs the tool straight from the TypeScript sources (alias of `start:dev`). |
| `npm run start:dev`  | Same as above.                                                             |
| `npm run build`      | Compiles the TypeScript sources to `dist/`.                                |
| `npm run start:prod` | Runs the compiled build (`dist/main.js`). Requires `npm run build` first.  |

`config.json` is always read from the project root at startup, so changing it never requires a rebuild.

### Cleaning up previous results

Every run writes a new set of timestamped files, so results accumulate in the output directory. Pass the `do-clean-up` argument to delete the output directory before the run starts:

```bash
npm start -- do-clean-up
```

The whole directory is removed, including any file in it that the tool did not create, so point `out.dir` at a folder used only for these results.

## Configuration

All settings live in [`config.json`](config.json), in the project root.

```json
{
  "region": "it",
  "crawler": {
    "maxReqsPerMin": 10
  },
  "ollama": {
    "enable": true,
    "model": "gemma4:12b",
    "think": true,
    "timeout": 1800000
  },
  "filter": {
    "cpu": {
      "enable": true,
      "sort.by": "normCpumark",
      "sort.direction": "desc",
      "limit": 1,
      "year.min": 2022,
      "category": "Desktop",
      "sockets": ["AM5", "FCLGA1851"],
      "cpumark.min": 20000
    },
    "gpu": {
      "enable": true,
      "sort.by": "normG3d",
      "sort.direction": "desc",
      "limit": 1,
      "year.min": 2022,
      "category": "Desktop",
      "vram.min": 15000,
      "g3d.min": 15000
    },
    "ssd": {
      "enable": true,
      "sort.by": "normDiskmark",
      "sort.direction": "desc",
      "limit": 1,
      "year.min": 2022,
      "size.min": 3000,
      "size.max": 5000,
      "diskmark.min": 20000
    },
    "hdd": {
      "enable": true,
      "sort.by": "normSize",
      "sort.direction": "desc",
      "limit": 1,
      "year.min": 2022,
      "size.min": 15000
    }
  },
  "out": {
    "dir": "out",
    "json": true,
    "csv": true,
    "txt": true
  }
}
```

> **Tip — disabling a setting.** JSON has no comments, so the bundled `config.json` "comments out" optional settings by prefixing their key with a double underscore (for example `"__year.max": 2099`). Keys with that prefix are simply ignored: remove the prefix to activate the setting. More generally, `config.json` is not validated — unknown or misspelled keys are silently ignored — so double-check your spelling.

### `region`

**Required.** Selects the idealo site used for searching and pricing. Prices are always in euros.

| Value | Site                                | Country |
| ----- | ----------------------------------- | ------- |
| `de`  | [idealo.de](https://www.idealo.de/) | Germany |
| `fr`  | [idealo.fr](https://www.idealo.fr/) | France  |
| `at`  | [idealo.at](https://www.idealo.at/) | Austria |
| `it`  | [idealo.it](https://www.idealo.it/) | Italy   |
| `es`  | [idealo.es](https://www.idealo.es/) | Spain   |

### `crawler`

Optional.

| Key             | Type        | Default  | Description                                                                                                                                                                   |
| --------------- | ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxReqsPerMin` | integer ≥ 1 | no limit | Maximum number of requests per minute. Omit the key for no limit (`0` is rejected with an error at startup). Requests are always processed one at a time, whatever the value. |

### `ollama`

Optional. Controls the automatic [product matching](#product-matching).

| Key       | Type                                         | Default                  | Description                                                                                                             |
| --------- | -------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `enable`  | boolean                                      | `false`                  | Let an Ollama model select the matching products. When `false` or omitted, you are asked to select them yourself.       |
| `host`    | string                                       | `http://127.0.0.1:11434` | Base URL of the Ollama server.                                                                                          |
| `model`   | string                                       | —                        | Name of the model to use, e.g. `gemma4:12b`. Required when `enable` is `true`.                                          |
| `think`   | boolean \| `"low"` \| `"medium"` \| `"high"` | model default            | Enables (or sets the level of) reasoning on models that support it.                                                     |
| `timeout` | number (milliseconds)                        | `300000` (5 minutes)     | How long to wait for the model's answer (`0` disables the timeout). Raise it if you run a large model on slow hardware. |

### `filter`

**Required.** Contains one section per component type: `cpu`, `gpu`, `ssd` and `hdd`. All four sections must be present; set `"enable": false` to skip a type.

Keys available in every section:

| Key              | Type                | Default  | Description                                                                                                                                           |
| ---------------- | ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable`         | boolean             | `false`  | Whether to process this component type.                                                                                                               |
| `sort.by`        | string              | —        | Field used to sort the filtered components before `limit` is applied (see [Sorting](#sorting)).                                                       |
| `sort.direction` | `"asc"` \| `"desc"` | `"asc"`  | Sort direction.                                                                                                                                       |
| `limit`          | number              | no limit | Maximum number of components to look up on idealo.                                                                                                    |
| `year.min`       | number              | —        | Earliest year (inclusive). The year is taken from the date of PassMark's first benchmark of the component, which is not necessarily its release date. |
| `year.max`       | number              | —        | Latest year (exclusive).                                                                                                                              |

Additional keys for `cpu`:

| Key                           | Type     | Description                                                                     |
| ----------------------------- | -------- | ------------------------------------------------------------------------------- |
| `category`                    | string   | Text that the PassMark category must contain, e.g. `"Desktop"`. Case-sensitive. |
| `sockets`                     | string[] | Accepted sockets, exactly as named by PassMark, e.g. `["AM5", "FCLGA1851"]`.    |
| `cpumark.min` / `cpumark.max` | number   | PassMark CPU Mark range.                                                        |

Additional keys for `gpu`:

| Key                     | Type   | Description                                                                                                           |
| ----------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `category`              | string | Text that the PassMark category must contain, e.g. `"Desktop"`. Case-sensitive.                                       |
| `vram.min` / `vram.max` | number | Video memory range, in **MB** (16 GB = 16384). GPUs whose memory size is unknown are excluded when `vram.min` is set. |
| `g3d.min` / `g3d.max`   | number | PassMark G3D Mark range.                                                                                              |

Additional keys for `ssd` and `hdd`:

| Key                             | Type   | Description                                                    |
| ------------------------------- | ------ | -------------------------------------------------------------- |
| `size.min` / `size.max`         | number | Capacity range, in **GB** (see the note on drive sizes below). |
| `diskmark.min` / `diskmark.max` | number | PassMark Disk Mark range.                                      |

How filters behave:

- **Ranges** — every `*.min` bound is inclusive and every `*.max` bound is exclusive. For example `"size.min": 3000, "size.max": 5000` keeps drives from 3000 GB up to, but not including, 5000 GB.
- **Optional filters** — a range bound (`*.min` / `*.max`) or a `category` that is omitted (or set to `0`, or to an empty string) is not applied. `limit` and `sockets` can only be switched off by leaving them out: `"limit": 0` keeps no component at all, and `"sockets": []` matches no CPU.
- **Order of operations** — components are filtered first, then sorted, then cut to `limit`. To price only the single fastest CPU that matches your filters, sort by `normCpumark` descending with `"limit": 1`.
- **Mind the limit** — every component that survives the limit triggers a search on idealo and one more request for each matched product. Without a `limit`, a loose filter can produce a very long run.
- **Drive sizes** — capacities are the ones reported by PassMark, converted with 1 TB = 1024 GB. PassMark reports the formatted capacity, so a drive sold as "4 TB" is listed as 3.6 TB, i.e. 3686.4 GB. Choose your `size.*` bounds accordingly.

#### Sorting

`sort.by` accepts the name of any field of a benchmark entry. The tool adds a few normalized, numeric fields that are the best candidates for sorting:

| Component type | Field          | Meaning             |
| -------------- | -------------- | ------------------- |
| all            | `normYear`     | Year                |
| `cpu`          | `normCpumark`  | CPU Mark            |
| `gpu`          | `normG3d`      | G3D Mark            |
| `gpu`          | `normVram`     | Video memory, in MB |
| `ssd`, `hdd`   | `normDiskmark` | Disk Mark           |
| `ssd`, `hdd`   | `normSize`     | Capacity, in GB     |

The original PassMark fields (such as `name`) can be used too, but most of them are text — including numbers like `"72,092"` — and text is sorted alphabetically, so prefer the normalized fields when sorting by a numeric value.

Field names are case-sensitive and are not checked. If `sort.by` is omitted or does not match an existing field, the list is left unsorted, so `limit` simply keeps the first entries returned by PassMark. Likewise, `sort.direction` must be exactly `"desc"` to sort in descending order: any other value sorts ascending.

### `out`

**Required.**

| Key    | Type    | Default | Description                                                                                                                                         |
| ------ | ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dir`  | string  | —       | **Required.** Output directory. A relative path is resolved from the project root. Created if missing, but its parent directory must already exist. |
| `json` | boolean | `false` | Write the results as JSON.                                                                                                                          |
| `csv`  | boolean | `false` | Write the results as CSV.                                                                                                                           |
| `txt`  | boolean | `false` | Write a human-readable text summary.                                                                                                                |

## Product matching

A benchmark entry and a shop listing rarely have the same name: "AMD Ryzen 9 9950X3D2" on PassMark may show up on idealo as several products ("… Boxed", "… Tray", and so on), mixed with unrelated results. For each component, the tool therefore has to decide which of the (up to 20) idealo suggestions really are that component. Every selected suggestion becomes a separate, individually priced row in the results. (A given idealo listing is priced only once per run: if it is selected for two different components, it appears under the first one only.)

**With Ollama** (`ollama.enable: true`) — the component details and the numbered list of suggestions are sent to the configured model, which is asked to reply with the indexes of the matching products, or `-1` if none match. The prompt and the model's reply are logged to the console so you can follow its decisions. The run is fully unattended.

The model's reply is used as-is, without validation: it must contain nothing but comma-separated indexes (for example `0,2`). Extra words, brackets or Markdown can make the tool select only some of the products, the wrong ones, or none at all, without any warning — so pick a model that follows instructions reliably, and check the logged replies if a result looks odd. If the call to Ollama itself fails (server not reachable, unknown model, timeout), it is retried up to three times; after that the component is skipped and the run continues.

**Without Ollama** — the tool prints the component details and shows an interactive checklist of the suggestions. Suggestions whose name is identical to the component name (ignoring case) are pre-selected. Use the arrow keys and the space bar to change the selection, then press Enter to confirm. The run needs your attention until every component has been matched.

When idealo has no suitable suggestion for a component, or nothing is selected, the component is skipped and does not appear in the results.

## Output

Results are written to the directory set in `out.dir`. Each run produces one file per enabled format and per component type that has at least one priced product:

```text
out/
├── cpus-2026-11-16T13-51-30-205Z.csv
├── cpus-2026-11-16T13-51-30-205Z.json
├── cpus-2026-11-16T13-51-30-205Z.txt
├── ssds-2026-11-16T13-51-30-205Z.csv
├── ssds-2026-11-16T13-51-30-205Z.json
└── ssds-2026-11-16T13-51-30-205Z.txt
```

The file name is the component type (`cpus`, `gpus`, `ssds`, `hdds`) followed by the UTC date and time of the run. If no product could be priced, no file is written.

In every file the products are sorted by **ratio** — score divided by price — from the best value to the worst:

| Component type | Ratio                  |
| -------------- | ---------------------- |
| CPU            | CPU Mark ÷ price       |
| GPU            | G3D Mark ÷ price       |
| SSD            | Disk Mark ÷ price      |
| HDD            | Capacity in GB ÷ price |

### Text (`.txt`)

A compact summary with the product name, its idealo link, the score, the price and the ratio:

```text
AMD Ryzen 9 9950X3D2 Dual Edition
https://www.idealo.it/confronta-prezzi/210010827/amd-ryzen-9-9950x3d2-dual-edition.html
Cpumark: 72092; Price: 813.68; Ratio: 88.6

AMD Ryzen 9 9950X3D2 Dual Edition Tray
https://www.idealo.it/confronta-prezzi/210010825/amd-ryzen-9-9950x3d2-dual-edition-tray.html
Cpumark: 72092; Price: 1050.08; Ratio: 68.7
```

### JSON (`.json`) and CSV (`.csv`)

The complete data set: every field of the PassMark entry, the normalized fields described in [Sorting](#sorting), plus:

| Field         | Description                                   |
| ------------- | --------------------------------------------- |
| `objType`     | Component type: `cpu`, `gpu`, `ssd` or `hdd`. |
| `idealoName`  | Product name on idealo.                       |
| `idealoUrl`   | Link to the product page on idealo.           |
| `idealoPrice` | Best total price in euros, shipping included. |
| `ratio`       | Score-to-price ratio (see the table above).   |

The JSON file contains an array of objects; the CSV file contains the same records with a header row (plus a `label` column that is always empty and can be ignored).

Note that `price` and `value`, where present, are PassMark's own figures (a US-dollar price and a value index) and are not used by the tool: the idealo price and the ranking are in `idealoPrice` and `ratio`.

## Project structure

```text
├── config.json            # Settings (region, crawler, Ollama, filters, output)
├── src/
│   ├── main.ts            # Entry point: banner → filter summary → clean-up → crawl → write
│   ├── run-crawler.ts     # Crawler setup and start URLs
│   ├── routes.ts          # Request handlers: PassMark lists and filtering, idealo matching and prices
│   ├── write-files.ts     # Ratio computation and JSON/CSV/TXT writers
│   ├── clean-up.ts        # Handling of the do-clean-up argument
│   ├── print-banner.ts    # Start-up banner with the current settings
│   ├── print-filter.ts    # Start-up summary of the search filter
│   ├── state.ts           # In-memory list of the priced products
│   ├── models/            # TypeScript types (config, PassMark, idealo, state)
│   └── utils/             # Constants (region data, parsers) and helper functions
├── package.json
└── tsconfig.json
```

## Built with

- [Crawlee](https://crawlee.dev/) and [Playwright](https://playwright.dev/) — crawling and browser automation
- [Ollama JavaScript library](https://github.com/ollama/ollama-js) — LLM-based product matching
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) — interactive prompts
- [csv](https://csv.js.org/) — CSV generation
- [TypeScript](https://www.typescriptlang.org/)

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by PassMark Software or idealo. It reads publicly available pages of their websites: use it responsibly, keep the request rate low and respect their terms of service. Because the tool depends on the structure of those websites, it may stop working if they change.

Benchmark scores and prices are provided as-is, with no guarantee of accuracy. Always double-check a price on the shop's page before buying.

## License

[ISC](https://opensource.org/license/isc-license-txt)
