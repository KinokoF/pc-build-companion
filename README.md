# PC Build Companion

> A simple tool for retrieving scores and prices for CPUs, GPUs, SSDs, and HDDs!

PC Build Companion helps you pick the parts for your next PC. It downloads the benchmark charts published by [PassMark](https://www.passmark.com/), keeps only the components that match your filters, looks up what they currently cost on the [idealo](https://www.idealo.de/) price comparison site, and ranks them by value for money — so you can see at a glance which parts give you the most performance (or storage) per euro.

A run on SSDs, for example, saves a ranking like this one as a text file, and also as JSON, CSV and a scatter plot:

```text
Corsair MP700 Pro XT
https://www.idealo.it/confronta-prezzi/208341761/corsair-mp700-pro-xt.html
Disk Mark: 93265; Price: 438; Ratio: 212.9

MSI Spatium M571 DLP 4TB
https://www.idealo.it/confronta-prezzi/209535513/msi-spatium-m571-dlp-4tb.html
Disk Mark: 94742; Price: 824.6; Ratio: 114.9
```

## Features

- **Four component types** — CPUs, GPUs, SSDs and HDDs, each with its own filters and each individually switchable.
- **Flexible filters** — year, category, socket, video memory, capacity and benchmark score ranges, plus sorting and a per-type limit.
- **Six idealo regions** — Germany, France, Austria, Italy, Spain and UK.
- **AI-assisted product matching** — a large language model (LLM) served by [Ollama](https://ollama.com/) decides which idealo listings actually correspond to a benchmarked component. Prefer to stay in control? Turn it off and pick the listings yourself from an interactive checklist.
- **Value ranking** — every priced product gets a score-to-price ratio, and results are sorted best value first.
- **Multiple output formats** — JSON, CSV, plain text and a PNG scatter plot of price against score.
- **Rate-limited crawling** — one page at a time, with an optional requests-per-minute cap.

## How it works

1. **Benchmarks** — the PassMark chart of every enabled component type is downloaded ([cpubenchmark.net](https://www.cpubenchmark.net/), [videocardbenchmark.net](https://www.videocardbenchmark.net/), [harddrivebenchmark.net](https://www.harddrivebenchmark.net/)).
2. **Filter** — your filters are applied, the remaining entries are sorted, and only the first `limit` entries are kept.
3. **Search** — each remaining component is looked up by name on idealo. Of the suggestions returned (the tool asks for up to 100), only the product pages in the right category (processors, graphics cards, SSDs or hard drives) are kept as candidates.
4. **Match** — the candidates that really correspond to the component are selected, either by an Ollama model or by you (see [Product matching](#product-matching)).
5. **Price** — each selected product page is opened and its best total price (shipping included) is read.
6. **Report** — the score-to-price ratio is computed and the results are written to the output directory (see [Output](#output)).

## Requirements

- **[Node.js](https://nodejs.org/)** with npm: version 22.22.2 or later in the 22.x line, 24.15.0 or later in the 24.x line, or any version from 26 on. This is the range accepted by the dependencies (`^22.22.2 || ^24.15.0 || >=26.0.0`); the tool itself has only been tested with Node.js 26.13.
- **Windows, macOS 14 or later, or Linux** (Ubuntu 22.04+, Debian 12+ or a comparable distribution) on a 64-bit (x64 or arm64) machine — some dependencies are native modules shipped as prebuilt binaries, and the browser used for crawling is available for these systems only.
- **[Ollama](https://ollama.com/)** (optional) — a program that runs LLMs on your own computer or server. It is only needed for automatic product matching, which the bundled `config.json` has switched on (see [Usage](#usage)). The model you configure must be available on the Ollama server (`ollama pull <model>`).

## Installation

```bash
git clone https://github.com/KinokoF/pc-build-companion.git
cd pc-build-companion
npm install
```

`npm install` also downloads Playwright's browsers (Chromium, Firefox and WebKit), through a `postinstall` script that runs the Playwright installer. The tool itself only uses Chromium, in headless mode: no browser window opens while it works. The browsers end up in Playwright's own per-user cache, not in the project directory, and take a fair amount of disk space (about 1.3 GB on Windows), so the first install can take a while.

On Linux, the browser may also need system libraries that `npm install` does not provide: `npx playwright install-deps` installs them.

## Usage

> [!IMPORTANT]
> The bundled `config.json` has automatic product matching switched on (`ollama.enable` is `true`, with the model `gemma4:12b`). Before your first run, either make sure an Ollama server is running and has that model (`ollama pull gemma4:12b`), or set `ollama.enable` to `false` to select the products yourself (see [Product matching](#product-matching)). Otherwise the matching step fails for every component and the run ends without results.

1. Adjust [`config.json`](config.json) to your needs (see [Configuration](#configuration)) — at the very least `region` (the bundled file searches idealo.it), the `ollama` settings and the filters of the component types you are interested in.
2. Run the tool:

   ```bash
   npm start
   ```

At startup the tool prints the settings and the search filters it is going to use, then logs its progress while it works. When the run is complete, the results are in the directory set in `out.dir` (`out/` in the bundled `config.json`). They are not printed in the terminal: the last line of a completed run is `Writing JSONs/CSVs/TXTs/plots...`, and the files written are not listed (see [Output](#output)). The line `Finished! Total … requests: … succeeded, … failed.` just above it shows whether any page or step had to be given up (see [Troubleshooting](#troubleshooting)).

> [!NOTE]
> Results are kept in memory and written only at the very end of the run. If the tool ends with an error, the prices collected so far are lost. If you stop it with Ctrl+C, the products priced up to that moment may still be written, but that is not guaranteed — so try your settings with a small [`limit`](#filter) first.

### Commands

| Command                              | Description                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `npm start` (or `npm run start:dev`) | Runs the tool straight from the TypeScript sources.                       |
| `npm run build`                      | Compiles the TypeScript sources to `dist/`.                               |
| `npm run start:prod`                 | Runs the compiled build (`dist/main.js`). Requires `npm run build` first. |

`config.json` is always read from the project root at startup, so changing it never requires a rebuild. `npm run build` type-checks the file, though, and can report an error (`TS2352`) for settings that `npm start` accepts — for example an `ollama` section without `model`, so keep that key even when `ollama.enable` is `false`.

### Cleaning up previous results

Every run writes a new set of timestamped files, so results accumulate in the output directory. Pass the `do-clean-up` argument to delete the output directory before the run starts. The argument is the bare word, without leading dashes; the `--` in the command below belongs to npm, which hands whatever follows it to the tool:

```bash
npm start -- do-clean-up
```

> [!WARNING]
> The whole directory is removed, including any file in it that the tool did not create, so point `out.dir` at a directory used only for these results. The deletion happens before the crawl: if the run then prices nothing, fails or is interrupted, the previous results are gone and nothing, or at most a partial result, replaces them.

## Configuration

All settings live in [`config.json`](config.json), in the project root. The file must be plain JSON: no comments, no trailing commas.

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
    "timeout": 1800
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
    "txt": true,
    "plot": true
  }
}
```

These are the active settings of the bundled `config.json`. They look up one component per type on idealo.it, in each case among the components first benchmarked in 2022 or later:

- the fastest desktop CPU for the AM5 or LGA 1851 socket;
- the fastest desktop GPU with at least 15000 MB of video memory;
- the fastest SSD between 3000 and 5000 GB (the "4 TB" class);
- the largest hard drive.

> [!TIP]
> JSON has no comments, so the bundled `config.json` "comments out" optional settings by prefixing their key with a double underscore (for example `"__year.max": 2099`). Such keys are simply never read: to activate a setting, remove the prefix and replace the placeholder value with your own.

`config.json` is not validated: unknown or misspelled keys are silently ignored. The summary printed at startup helps to spot them — a setting you meant to set but that is shown as `<unset>` (`undefined` for `region` and `out.dir`) was not recognized.

A note on notation: in this README, a dotted name such as `ollama.enable` or `out.dir` is shorthand for a key inside a section (`enable` inside `ollama`, `dir` inside `out`). Only in the [`filter`](#filter) sections is the dot part of the key name itself: `"year.min": 2022` is a single flat key.

### `region`

**Required.** Selects the idealo site used for searching and pricing. Prices are always in euros.

| Value | Site                                      | Country |
| ----- | ----------------------------------------- | ------- |
| `de`  | [idealo.de](https://www.idealo.de/)       | Germany |
| `fr`  | [idealo.fr](https://www.idealo.fr/)       | France  |
| `at`  | [idealo.at](https://www.idealo.at/)       | Austria |
| `it`  | [idealo.it](https://www.idealo.it/)       | Italy   |
| `es`  | [idealo.es](https://www.idealo.es/)       | Spain   |
| `uk`  | [idealo.co.uk](https://www.idealo.co.uk/) | UK      |

Only these six values are supported, exactly as written (in lower case). The value is not checked at startup: with any other value the benchmark charts are still downloaded, but every idealo search fails and no price is collected.

### `crawler`

Optional.

| Key             | Type        | Default  | Description                                                                                                                                                 |
| --------------- | ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxReqsPerMin` | integer ≥ 1 | no limit | Maximum number of pages loaded per minute. Omit the key for no limit; `0`, negative and fractional values are rejected with an error when the crawl starts. |

Pages are always loaded one at a time, whatever the value. The cap is applied over a rolling 60-second window, not by spacing the requests evenly: the tool loads up to `maxReqsPerMin` pages in a row and then waits, without logging anything, until the window frees up. With a low value, pauses of up to a minute are therefore normal. Retries count as page loads too (see [Troubleshooting](#troubleshooting)).

### `ollama`

Optional. Controls the automatic [product matching](#product-matching).

| Key       | Type                                         | Default                  | Description                                                                                                                                                                                                                                                                                                                                                    |
| --------- | -------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable`  | boolean                                      | `false`                  | Let an Ollama model select the matching products. When `false` or omitted, you are asked to select them yourself.                                                                                                                                                                                                                                              |
| `host`    | string                                       | `http://127.0.0.1:11434` | Address of the Ollama server. When you give a full URL, include the port (e.g. `http://192.168.1.5:11434`). The `OLLAMA_HOST` environment variable is not read: this key is the only way to use another server.                                                                                                                                                |
| `model`   | string                                       | —                        | Name of the model to use, e.g. `gemma4:12b`. Required when `enable` is `true`.                                                                                                                                                                                                                                                                                 |
| `think`   | boolean \| `"low"` \| `"medium"` \| `"high"` | model default            | Turns reasoning ("thinking") on or off, or sets its level. Use it only with a model that supports thinking: for any other model, Ollama rejects `true` or a level with an error, so the matching fails for every component. If you change `model`, check that the new one supports thinking, or remove this key (the bundled `config.json` sets it to `true`). |
| `timeout` | number (seconds)                             | `300` (5 minutes)        | How long to wait for the model's answer, in whole seconds. Raise it if you run a large model on slow hardware. `0` means the default, not "no timeout". A call that times out is retried up to three times, so a model that never answers can take four times this value per component.                                                                        |

### `filter`

**Required.** Contains one section per component type: `cpu`, `gpu`, `ssd` and `hdd`. All four sections must be present, or the tool does not start; to skip a type, set its `enable` key to `false` (or omit that key).

Keys available in every section:

| Key              | Type                | Default  | Description                                                                                                                                                               |
| ---------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable`         | boolean             | `false`  | Whether to process this component type.                                                                                                                                   |
| `sort.by`        | string              | —        | Field used to sort the filtered components before `limit` is applied (see [Sorting](#sorting)).                                                                           |
| `sort.direction` | `"asc"` \| `"desc"` | `"asc"`  | Sort direction.                                                                                                                                                           |
| `limit`          | integer             | no limit | Maximum number of components to look up on idealo.                                                                                                                        |
| `year.min`       | number              | —        | Earliest year (inclusive). The year is taken from PassMark's "Test Date", the date of the first benchmark submitted for the component — not necessarily its release date. |
| `year.max`       | number              | —        | Upper bound for the year (exclusive): `2026` keeps components up to 2025.                                                                                                 |

Additional keys for `cpu`:

| Key                           | Type     | Description                                                                                                                                                |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`                    | string   | Text that the PassMark category must contain, e.g. `"Desktop"`. Case-sensitive. PassMark's CPU categories are Desktop, Laptop, Server and Mobile/Embedded. |
| `sockets`                     | string[] | Accepted sockets, exactly as named by PassMark, e.g. `["AM5", "FCLGA1851"]`.                                                                               |
| `cpumark.min` / `cpumark.max` | number   | PassMark CPU Mark range.                                                                                                                                   |

Additional keys for `gpu`:

| Key                     | Type   | Description                                                                                                                                    |
| ----------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`              | string | Text that the PassMark category must contain, e.g. `"Desktop"`. Case-sensitive. PassMark's GPU categories are Desktop, Mobile and Workstation. |
| `vram.min` / `vram.max` | number | Video memory range, in **MB** (16 GB = 16384).                                                                                                 |
| `g3d.min` / `g3d.max`   | number | PassMark G3D Mark range.                                                                                                                       |

Additional keys for `ssd` and `hdd`:

| Key                             | Type   | Description                                                    |
| ------------------------------- | ------ | -------------------------------------------------------------- |
| `size.min` / `size.max`         | number | Capacity range, in **GB** (see the note on drive sizes below). |
| `diskmark.min` / `diskmark.max` | number | PassMark Disk Mark range.                                      |

Filter keys are flat names that contain a dot (`"year.min": 2022`), not nested objects.

How filters behave:

- **Ranges** — every `*.min` bound is inclusive and every `*.max` bound is exclusive. For example, `"size.min": 3000, "size.max": 5000` keeps drives from 3000 GB up to, but not including, 5000 GB.
- **Optional filters** — a filter that is omitted is not applied, and neither is a range bound set to `0` or a `category` set to an empty string. `limit` and `sockets` are different: `"limit": 0` keeps no component at all and `"sockets": []` matches no CPU, so leave them out to switch them off.
- **Order of operations** — components are filtered first, then sorted, then cut to `limit`. To price only the single fastest CPU that matches your filters, sort by `normCpumark` descending with `"limit": 1`.
- **Mind the limit** — `limit` counts benchmark components, not result rows. Every component that survives it triggers a search on idealo and, if candidates are found, a matching step and one more page load for each matched product. Without a `limit`, a loose filter can produce a very long run.
- **Video memory** — GPUs whose memory size is unknown to PassMark are excluded by `vram.min`, but not by `vram.max` alone.
- **Drive sizes** — capacities are the ones reported by PassMark, converted with 1 TB = 1024 GB. PassMark reports the formatted capacity, so a drive sold as "4 TB" is listed as 3.6 TB or 3.7 TB depending on the model, i.e. 3686.4 GB or 3788.8 GB. Choose your `size.*` bounds accordingly.

#### Sorting

`sort.by` accepts the name of any field of a benchmark entry. The tool adds a few normalized, numeric fields that are the best candidates for sorting:

| Component type | Field          | Meaning                                 |
| -------------- | -------------- | --------------------------------------- |
| all            | `normYear`     | Year                                    |
| `cpu`          | `normCpumark`  | CPU Mark                                |
| `gpu`          | `normG3d`      | G3D Mark                                |
| `gpu`          | `normVram`     | Video memory, in MB (`-1` when unknown) |
| `ssd`, `hdd`   | `normDiskmark` | Disk Mark                               |
| `ssd`, `hdd`   | `normSize`     | Capacity, in GB                         |

The original PassMark fields (such as `name`) can be used too, but most of them are text — including numbers like `"93,265"` — and text is sorted alphabetically, so prefer the normalized fields when sorting by a numeric value.

Field names are case-sensitive and are not checked. If `sort.by` is omitted or does not match an existing field, the list is left in PassMark's order, so `limit` simply keeps the first matching entries. Likewise, `sort.direction` must be exactly `"desc"` to sort in descending order: any other value sorts ascending.

### `out`

**Required.** Sets where the results are written and in which formats (described in [Output](#output)).

| Key    | Type    | Default | Description                                                                                                                                                                                                                                |
| ------ | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dir`  | string  | —       | **Required.** Output directory. A relative path is resolved from the project root. The directory is created if missing, but its parent directory must already exist — otherwise the run fails at the very end, when the files are written. |
| `json` | boolean | `false` | Write the results as JSON.                                                                                                                                                                                                                 |
| `csv`  | boolean | `false` | Write the results as CSV.                                                                                                                                                                                                                  |
| `txt`  | boolean | `false` | Write a human-readable text summary.                                                                                                                                                                                                       |
| `plot` | boolean | `false` | Write a PNG scatter plot of price against score.                                                                                                                                                                                           |

## Product matching

A benchmark entry and an idealo listing rarely have the same name: "Samsung 9100 PRO 4TB SSD" on PassMark shows up on idealo as "Samsung 9100 Pro 4TB", but also as separate listings for its variants (with a heatsink, for instance), and a search can return unrelated products as well. For each component, the tool therefore has to decide which of the candidates found on idealo really are that component. Every selected candidate becomes a separate, individually priced row in the results.

**With Ollama** (`ollama.enable: true`) — the details of the component and the numbered list of candidate names are sent to the configured model, which is asked to reply with the indexes of the matching products, or `-1` if none match. The prompt and the model's reply are logged to the console, so you can follow its decisions; nothing is logged while the model is working. The run is fully unattended. If the call to the model fails — server not reachable, model not installed, no answer within `ollama.timeout` — the whole step is retried later, up to three times: the search page is loaded again and the model is asked again. If it keeps failing, the component is dropped and is missing from the results, and the run carries on with the others (see [Troubleshooting](#troubleshooting)).

The reply must be exactly a comma-separated list of indexes (such as `0,2`) or `-1`. Anything else — extra words, spaces, brackets, Markdown, even a trailing line break — is discarded and treated as "no match". An index that does not correspond to any candidate is ignored without a message. Pick a model that follows instructions reliably, and check the logged replies if a component is unexpectedly missing from the results.

**Without Ollama** — the tool prints the details of the component and shows an interactive checklist of the candidates. Candidates whose name is identical to the component name (ignoring case) are pre-selected. Move with the arrow keys, toggle with the space bar (`a` selects everything, `i` inverts the selection) and confirm with Enter; confirming with nothing selected skips the component. A long list scrolls: only seven candidates are visible at a time, so a pre-selected one can be out of sight. This mode needs an interactive terminal and your attention until every component has been matched; the prices are fetched afterward, except that the checklist of a search that is retried (after a failure or Ctrl+C) can appear while they are being fetched.

Ctrl+C stops the tool only when no checklist is displayed. While one is on screen, it merely cancels that question (a `WARN … User force closed the prompt with SIGINT` line appears): the tool carries on, and the same checklist comes back later in the run. A checklist can be canceled three times this way; the fourth time, the component is dropped. To stop the tool while a checklist is displayed, press Ctrl+C twice in quick succession, so that the second press arrives before the next checklist appears.

A component is skipped, and does not appear in the results, when idealo has no suitable candidate for it (`No suggestions :c` in the log) or when nothing is selected (`No selection :c`). A component, or one of its products, is also missing when its search, matching or price step keeps failing (see [Troubleshooting](#troubleshooting)). A given idealo listing is priced only once per run: if it is selected for two different components, it appears under the first one only.

## Output

Results are written to the directory set in `out.dir`. Each run produces one file per enabled format for every component type that has at least one priced product:

```text
out/
├── cpus-2026-11-17T15-07-14-029Z.csv
├── cpus-2026-11-17T15-07-14-029Z.json
├── cpus-2026-11-17T15-07-14-029Z.png
├── cpus-2026-11-17T15-07-14-029Z.txt
├── ssds-2026-11-17T15-07-14-029Z.csv
├── ssds-2026-11-17T15-07-14-029Z.json
├── ssds-2026-11-17T15-07-14-029Z.png
└── ssds-2026-11-17T15-07-14-029Z.txt
```

The file name is the component type (`cpus`, `gpus`, `ssds`, `hdds`) followed by the UTC date and time at which the files were written. If no product could be priced, no file is written.

In every file the products are sorted by **ratio** — score divided by price — from the best value to the worst:

| Component type | Ratio                  |
| -------------- | ---------------------- |
| CPU            | CPU Mark ÷ price       |
| GPU            | G3D Mark ÷ price       |
| SSD            | Disk Mark ÷ price      |
| HDD            | Capacity in GB ÷ price |

### Text (`.txt`)

A compact summary, like the example at the top of this page: for each product, its name on idealo, the link to its idealo page, then the score, the price in euros and the ratio (rounded to one decimal place). The score is labeled `CPU Mark`, `G3D Mark`, `Disk Mark` or `Size (GB)`, depending on the component type.

### JSON (`.json`) and CSV (`.csv`)

The complete data set: every field of the PassMark entry, the normalized fields described in [Sorting](#sorting), plus:

| Field         | Description                                   |
| ------------- | --------------------------------------------- |
| `objType`     | Component type: `cpu`, `gpu`, `ssd` or `hdd`. |
| `idealoName`  | Product name on idealo.                       |
| `idealoUrl`   | Link to the product page on idealo.           |
| `idealoPrice` | Best total price in euros, shipping included. |
| `ratio`       | Score-to-price ratio (see the table above).   |

The JSON file contains an array of objects, written on a single line; the CSV file contains the same records with a header row. This is one SSD record, formatted here for readability:

```json
{
  "objType": "ssd",
  "id": "47598",
  "name": "Corsair MP700 PRO XT",
  "size": "3.6 TB",
  "diskmark": "93,265",
  "samples": "16",
  "rank": 5,
  "price": "NA",
  "value": "NA",
  "date": "Dec 2025",
  "type": "SSD",
  "href": "Corsair+MP700+PRO+XT&amp;id=47598",
  "output": true,
  "normYear": 2025,
  "normSize": 3686.4,
  "normDiskmark": 93265,
  "idealoName": "Corsair MP700 Pro XT",
  "idealoUrl": "https://www.idealo.it/confronta-prezzi/208341761/corsair-mp700-pro-xt.html",
  "idealoPrice": 438,
  "ratio": 212.9337899543379
}
```

Note that `price` and `value` are PassMark's own figures (a US-dollar price and a value index derived from it) and play no part in the ranking: the idealo price is in `idealoPrice`, and the ranking is based on `ratio`.

### Scatter plot (`.png`)

A 1200 × 900 pixel chart with one labeled point per product: the score on the horizontal axis (CPU Mark, G3D Mark, Disk Mark or, for HDDs, the capacity in GB) and the idealo price in euros on the vertical axis, both starting at zero. The lower and the further to the right a point lies, the better its value for money; more precisely, the flatter the straight line from the origin to a point, the higher that product's ratio.

The labels are the product names on idealo and the colors only serve to tell the points apart. Labels are not rearranged to fit: long names can be cut off at the edge of the image, and the labels of nearby points can overlap or even cover a neighboring point.

## Troubleshooting

- **A `WARN` line about "the `browser` option of ImpitHttpClient"** — it is printed at every start and is harmless. Like the other lines prefixed with `INFO`, `WARN` or `ERROR`, it comes from Crawlee, the crawling library the tool is built on.

- **The tool seems stuck** — it is probably waiting for the model's answer (nothing is logged in the meantime), for your selection, for the requests-per-minute window to free up (see [`crawler`](#crawler)), or for a page that lacks the expected content (30 seconds per attempt, see the next entry).

- **`WARN … Reclaiming failed request` and `ERROR … Request failed and reached maximum retries`** — a page that fails to load, or a search, matching or price step that fails, does not stop the run. The request goes back to the end of the queue and is tried again later, up to three times, with a `WARN … Reclaiming failed request back to the list or queue` message each time (often followed by a stack trace). Every attempt repeats the whole step: the page is loaded again and, for a search, the model is asked or the checklist shown again. If a retry succeeds, nothing is lost. After the fourth failure the request is dropped with an `ERROR … Request failed and reached maximum retries` message and the run goes on without it, so the product or component concerned (or, if the page is a PassMark chart, every component of that chart) is missing from the results. The `url` at the end of each of these log entries, after any stack trace, shows which page it was. The text that follows the message gives the cause:

  - `fetch failed` means that the Ollama server could not be reached or did not answer within `ollama.timeout`; if the request is eventually dropped, the `Error analysis` line logged at the end of the run tells the two apart (`connect ECONNREFUSED` or `Headers Timeout Error`);
  - `model '…' not found` means that the model has to be pulled first (`ollama pull <model>`);
  - `… does not support thinking` means that `ollama.think` has to be removed for that model;
  - `locator.textContent: Timeout 30000ms exceeded` or `locator.innerText: Timeout 30000ms exceeded` means that an idealo page did not contain the expected search results or price;
  - `Cannot read properties of undefined (reading 'urlPrefix')` means that [`region`](#region) is not one of the supported values;
  - `User force closed the prompt with SIGINT` means that Ctrl+C was pressed while a checklist was displayed;
  - `Request blocked - received 403 status code` (or `429`) and `… - Internal Server Error` mean that the site refused the request or answered with an error. If most pages end this way, the site is probably rejecting the tool's requests: try again later, with a lower `crawler.maxReqsPerMin`.

  The `failed` count in the `Finished! Total … requests` line at the end of the run is the number of requests that were dropped.

- **The run completes but no file is written** — no product was priced. Possible causes: no component type is enabled; no component passed your filters; every component was skipped during the search or the matching (look for `No suggestions :c` and `No selection :c` in the log); or, for every component, a page or step kept failing until it was dropped (see the previous entry), which is what happens when Ollama is enabled but cannot be reached or lacks the model. Also check that at least one output format (`out.json`, `out.csv`, `out.txt` or `out.plot`) is enabled.

- **`BrowserLaunchError` / `Executable doesn't exist`** — the Playwright browsers are missing: run `npx playwright install`. On Linux the browser may also need system libraries, which `npx playwright install-deps` installs.

- **After Ctrl+C, the log says `To resume, do: CRAWLEE_PURGE_ON_START=0 npm start`** — ignore this hint, which comes from Crawlee. A run started that way skips the pages that were already processed without recovering their prices, so its results can be incomplete. Simply start the tool again.

- **The firewall asks whether to allow Node.js** — Crawlee runs a local proxy for its own browser and keeps it listening on a random TCP port for as long as the tool runs. The port is opened on all network interfaces and requires no authentication, but the tool only uses it through `127.0.0.1`: there is no need to allow incoming connections to Node.js.

## Project structure

```text
├── config.json            # Settings (region, crawler, Ollama, filters, output)
├── src/
│   ├── main.ts            # Entry point: banner → filter summary → clean-up → crawl → write
│   ├── run-crawler.ts     # Crawler setup and start URLs
│   ├── routes.ts          # Request handlers: PassMark lists and filtering, idealo matching and prices
│   ├── write-files.ts     # Ratio computation and JSON/CSV/TXT/PNG writers
│   ├── clean-up.ts        # Handling of the do-clean-up argument
│   ├── print-banner.ts    # Startup banner with the current settings
│   ├── print-filter.ts    # Startup summary of the search filters
│   ├── state.ts           # In-memory list of the priced products
│   ├── models/            # TypeScript types (config, PassMark, idealo, state)
│   └── utils/             # Constants (region data, parsers) and helper functions
├── package.json
└── tsconfig.json
```

Running the tool also creates two git-ignored directories in the project root: `out/` (the results, with the `out.dir` of the bundled `config.json`) and `storage/` (working data of Crawlee, emptied at the start of every run and safe to delete). `npm run build` adds `dist/` (also git-ignored) and a `tsconfig.tsbuildinfo` file, TypeScript's incremental-build cache. If you delete `dist/`, delete that file as well: otherwise the next build finds nothing to do and does not recreate `dist/`.

## Built with

- [Crawlee](https://crawlee.dev/) and [Playwright](https://playwright.dev/) — crawling and browser automation
- [Ollama JavaScript library](https://github.com/ollama/ollama-js) — LLM-based product matching
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) — interactive prompts
- [Chart.js](https://www.chartjs.org/), [chartjs-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/) and [node-canvas](https://github.com/Automattic/node-canvas) — scatter plots
- [csv](https://csv.js.org/) — CSV generation
- [TypeScript](https://www.typescriptlang.org/) and [tsx](https://tsx.hirok.io/) — language and TypeScript runner

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by PassMark Software or idealo. It reads publicly available pages of their websites: use it responsibly, keep the request rate low and respect their terms of service. Because the tool depends on the structure of those websites, it may stop working if they change.

Benchmark scores and prices are provided as is, with no guarantee of accuracy. Always double-check a price on the shop's page before buying.

## License

[ISC](https://opensource.org/license/isc)
