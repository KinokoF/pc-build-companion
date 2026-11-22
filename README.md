# PC Build Companion

> A simple tool for retrieving scores and prices for CPUs, GPUs, SSDs, and HDDs!

PC Build Companion helps you choose the parts for a PC build by answering one question: **which components give you the most performance for your money right now?**

It takes benchmark scores from [PassMark](https://www.passmark.com/), finds the matching products and their current prices on the European price-comparison site [idealo](https://www.idealo.de/), and ranks everything by score-to-price ratio. The results are saved as JSON, CSV, plain text and scatter plots.

## Live example

Want to see the results before installing anything? My own config and the outputs it generates (JSON, CSV, TXT and plots) are published at **[https://serverchan.org/pbc.html](https://serverchan.org/pbc.html)** and updated daily.

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [Output](#output)
- [Good to know](#good-to-know)
- [Troubleshooting](#troubleshooting)
- [Disclaimer](#disclaimer)
- [Built with](#built-with)
- [License](#license)

## Features

- **Four component types** — CPUs, GPUs, SSDs and HDDs, each with its own filter (year, category, socket, VRAM, capacity, score range).
- **Benchmark scores from PassMark** — taken from its public CPU, video card and drive lists.
- **Current prices from idealo** — for Germany, France, Austria, Italy and Spain, with or without shipping costs.
- **Automatic product matching** — an LLM served by [Ollama](https://ollama.com/) decides which shop products correspond to each benchmarked component. No LLM? Pick the matches yourself from an interactive list.
- **Ready-to-use results** — a ranking by score-to-price ratio as JSON, CSV and TXT, plus a PNG scatter plot of score versus price.
- **Loop mode** — keep the tool running: when a run is finished, it pauses for as long as you choose (a day, for example) and then starts over.
- **One page at a time** — pages are loaded sequentially, and `crawler.maxReqsPerMin` can cap how many are loaded per minute (there is no cap unless you set it).

## How it works

```text
PassMark lists → filter / sort / limit
  → idealo search → match (LLM or you)
  → idealo price → rank
  → JSON / CSV / TXT / PNG
```

1. **Download the benchmark lists.** For every enabled component type, the tool opens the corresponding PassMark "Mega List" in a headless browser and downloads the complete list behind it.
2. **Filter, sort and limit.** The list is narrowed down with your [filter](#filter), sorted, and optionally cut to the first _N_ entries.
3. **Search idealo.** Each remaining component is looked up by name on idealo, inside the right category (CPUs, graphics cards, SSDs or hard drives) of the selected region.
4. **Match products.** The search results are compared with the component to decide which products really correspond to it. An LLM does this through Ollama; without it, you tick the right products in an interactive list. See [Matching products](#matching-products).
5. **Read the price.** The idealo page of each matched product is opened to read its price, with or without shipping (see [`scraping`](#scraping)). Products that have no offers are skipped.
6. **Rank and export.** For each component type, the products are ranked by `ratio = score / price` and written to the output directory.

The score depends on the component type:

| Type | Score | PassMark source |
| --- | --- | --- |
| CPU | CPU Mark | [CPU Mega List](https://www.cpubenchmark.net/CPU_mega_page.html) |
| GPU | G3D Mark | [Video Card Mega List](https://www.videocardbenchmark.net/GPU_mega_page.html) |
| SSD | Disk Mark | [Drive Mega List](https://www.harddrivebenchmark.net/hdd-mega-page.html) |
| HDD | Capacity, in GB | [Drive Mega List](https://www.harddrivebenchmark.net/hdd-mega-page.html) |

HDDs are ranked by capacity rather than speed, so their ratio reads as "gigabytes per euro".

## Requirements

- **[Node.js](https://nodejs.org/)** with npm: version 22.22.2 or later on the 22.x line, 24.15 or later on the 24.x line, or 26 and later.
- **Windows, macOS or Linux**, on x64 or arm64, in a version [supported by Playwright](https://playwright.dev/docs/intro#system-requirements): currently Windows 11 or Windows Server 2019 and later, macOS 14 and later, Debian 12 or 13, Ubuntu 22.04, 24.04 or 26.04. On older systems such as macOS 13, Ubuntu 20.04 or Debian 11, `npm install` fails, because there is no browser build for them.
- **About 1.5 GB of disk space**, most of it for the browsers that `npm install` downloads (see [Installation](#installation)).
- **[Ollama](https://ollama.com/)** (optional) — only for automatic product matching:
  - Any Ollama server that the tool can reach will do, on the same machine or on another one, provided that the model you want to use has already been pulled there (`ollama pull <model>`).
  - A server on another machine must accept network connections first: by default Ollama only listens on `127.0.0.1` (see [How can I expose Ollama on my network?](https://docs.ollama.com/faq#how-can-i-expose-ollama-on-my-network)).
  - Use a model that the server runs itself: the tool relies on [structured outputs](https://docs.ollama.com/capabilities/structured-outputs), which Ollama's cloud models currently don't support.
  - Ollama 0.5 or later is required; the `think` option needs 0.9 or later, and 0.11 or later when it is set to a level such as `"high"`.

## Installation

```bash
git clone https://github.com/KinokoF/pc-build-companion.git
cd pc-build-companion
npm install
```

`npm install` also downloads Playwright's default browsers (Chromium, Firefox and WebKit): a download of roughly 500 MB that takes about 1.3 GB once unpacked, so the first installation can take a few minutes. The tool itself only uses Chromium. The browsers are stored outside the project, in [Playwright](https://playwright.dev/)'s per-user cache (`%LOCALAPPDATA%\ms-playwright` on Windows, `~/Library/Caches/ms-playwright` on macOS, `~/.cache/ms-playwright` on Linux), so deleting the project directory doesn't remove them.

On Linux the browser also relies on a number of system libraries. If it fails to start, run `npx playwright install-deps chromium` in the project directory: on Debian and Ubuntu it installs them, asking for your sudo password.

## Quick start

1. Open [`config.json`](config.json). As shipped, it asks idealo.it for prices and expects an Ollama server on this machine (`http://127.0.0.1:11434`) with the model `gemma4:12b` and thinking enabled. Adapt it to your setup:
   - set `regions` to the idealo site(s) you want prices from: `de`, `fr`, `at`, `it` or `es`, for example `["de"]` or `["de", "at"]`;
   - set `ollama.model` to a model available on your Ollama server (and remove `think` if that model doesn't support thinking), **or** set `ollama.enable` to `false` to pick the matching products by hand;
   - if your Ollama server runs on another machine or port, rename `__host` to `host` and set it to the server's address, port included, for example `http://192.168.1.50:11434`.
2. Start the tool:

   ```bash
   npm start
   ```

3. Find the results in the `out` directory.

The sample config keeps `limit` at `1` for every component type, so the first run only looks up one CPU, one GPU, one SSD and one HDD: enough to check that everything works. Raise or remove `limit` once it does.

What to expect: the tool prints its configuration and filters, then its progress (`Scraping CPUs...`, `Scraping Idealo search results for …`, the matching step, `Scraping Idealo price for …` and `Price: …`). With Ollama, the matching step shows `Asking <model>...`, the prompt and the model's `Response:`; with Ollama disabled, it shows the list of products to choose from instead. A run ends with `Finished! Total N requests: X succeeded, Y failed.` and `Writing JSONs/CSVs/TXTs/plots...`. A warning about `ImpitHttpClient` right after the start is normal. So are long pauses without any output: the sample config loads at most 10 pages per minute, and with `think` enabled the model can take minutes to answer each prompt, so even this small run can take several minutes. Set `think` to `false` for a faster first test.

## Usage

```bash
# Run with ./config.json
npm start

# Run with another config file
npm start -- path/to/my-config.json

# Delete the output directory before starting
npm run start:dev -- --cleanup
npm run start:dev -- --cleanup path/to/my-config.json
```

Options such as `--cleanup` must be passed through `npm run start:dev -- …`. `npm start` is only a shortcut for that script: with `npm start -- --cleanup`, npm takes the option for itself and, depending on the npm version, the tool starts without cleaning up or doesn't start at all.

> [!WARNING]
> `--cleanup` deletes the whole `out.dir` directory with everything in it, without asking, and not only the files written by the tool. Point `out.dir` at a directory that is used for nothing else.

To run the compiled JavaScript instead of the TypeScript sources:

```bash
npm run build
npm run start:prod
npm run start:prod -- --cleanup path/to/my-config.json
```

### Command line

```text
Usage: main [options] [config-path]

Arguments:
  config-path    Config file path (default: "config.json")

Options:
  -c, --cleanup  Delete out.dir on startup
  -h, --help     display help for command
```

Relative paths — the config path and `out.dir` — are resolved against the working directory, which is the project root whenever the tool is started through npm.

### Matching products

A benchmark entry and a shop listing rarely share the same name: PassMark knows a `Radeon RX 9060 XT 16GB`, while idealo lists many cards from different manufacturers built around it. Someone has to decide which search results really are the component being looked up.

- **With Ollama** (`ollama.enable` set to `true`) — the component's data and the numbered list of candidate products are sent to the configured model, which answers with the numbers of the products that match. The prompt and the answer are printed to the console, so you can always see what was asked and what was picked. This mode needs no interaction: it is the one to use for unattended and looping runs.
- **Without Ollama** — the candidates are shown as a checkbox list in the terminal. Products whose name is identical to the component's are pre-selected. Move with the arrow keys, toggle with <kbd>Space</kbd> (<kbd>a</kbd> toggles all, <kbd>i</kbd> inverts the selection) and confirm with <kbd>Enter</kbd>; confirming an empty selection skips the component. This mode needs an interactive terminal.

One component can match several products (different manufacturers, boxed and tray versions, …). Each match whose price can be read becomes a row of its own in the results, with the same score and its own price.

## Configuration

The tool is configured through a JSON file: `config.json` in the working directory by default, or the file passed on the [command line](#command-line). Besides the sample [`config.json`](config.json) in this repository, you can look at the config I actually use on the [live example page](https://serverchan.org/pbc.html).

A small but complete example:

```json
{
  "regions": ["it"],
  "crawler": { "maxReqsPerMin": 10 },
  "ollama": { "enable": true, "model": "gemma4:12b", "think": true, "timeout": 1800 },
  "filter": {
    "cpu": {
      "enable": true,
      "sort.by": "normCpumark",
      "sort.direction": "desc",
      "limit": 10,
      "year.min": 2022,
      "category": "Desktop",
      "sockets": ["AM5", "AM5 (LGA 1718)", "FCLGA1851"],
      "cpumark.min": 20000
    },
    "gpu": {
      "enable": true,
      "sort.by": "normG3d",
      "sort.direction": "desc",
      "limit": 10,
      "year.min": 2022,
      "category": "Desktop",
      "vram.min": 15000,
      "g3d.min": 15000
    }
  },
  "scraping": { "priceIncludingShipping": true },
  "out": { "json": true, "csv": true, "txt": true, "plot": true }
}
```

With this config the tool looks up, on idealo.it, the 10 fastest desktop CPUs for the AM5 and LGA 1851 sockets, and the 10 fastest desktop GPUs with at least 15000 MB of VRAM (that is, 16 GB cards and up). In both cases only components first benchmarked in 2022 or later are considered, with a minimum score of 20000 (CPU Mark) and 15000 (G3D Mark). SSDs and HDDs are skipped because they have no filter. Products are matched by the `gemma4:12b` model with thinking enabled, on an Ollama server at the default address, with up to 30 minutes (1800 seconds) per answer, and at most 10 pages are loaded per minute. Prices include shipping, and all four output formats are written to `out`.

> [!TIP]
> JSON has no comments, but keys that the tool doesn't know are simply ignored. The sample config uses this to keep optional settings at hand: a key prefixed with `__` (for example `"__year.max": 2099`) is switched off; remove the prefix to switch it on.
>
> The other side of the coin: the config is not validated. A misspelled optional key is silently ignored, while a missing or misspelled `regions` or `filter` stops the tool at startup with a raw JavaScript error instead of a clear message (see [Troubleshooting](#troubleshooting)).

### `regions`

**Required.** The list of idealo sites to get prices from. The whole process is repeated for each region, one after the other. Only these five codes work:

| Region | Site | Currency |
| --- | --- | --- |
| `de` | idealo.de | EUR |
| `fr` | idealo.fr | EUR |
| `at` | idealo.at | EUR |
| `it` | idealo.it | EUR |
| `es` | idealo.es | EUR |

### `crawler`

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `maxReqsPerMin` | number | no limit | Maximum number of pages loaded per minute, PassMark and idealo together. It must be a whole number of at least 1; leave the key out for no limit. |

Pages are always loaded one at a time. The limit is a rolling 60-second budget rather than an even delay: with `10`, the crawler may load 10 pages back to back and then pause until the minute has passed.

### `ollama`

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `enable` | boolean | `false` | Match products with an LLM. Otherwise you select the matches yourself (see [Matching products](#matching-products)). |
| `host` | string | `http://127.0.0.1:11434` | Address of the Ollama server. Always include the port, as in `http://192.168.1.50:11434`. The `OLLAMA_HOST` environment variable is not used. |
| `model` | string | — | Name of the model, for example `gemma4:12b`. Required when `enable` is `true`. |
| `think` | boolean or string | model default | Thinking mode: `true` or `false`, or a level (`"low"`, `"medium"`, `"high"`) for the models that support levels. When left out, the model's own default applies, which usually means that a model able to think does so. |
| `timeout` | number | `300` | Maximum time, in whole seconds, to wait for the model's complete answer to one matching request, including model loading and thinking. It can't be switched off: `0` counts as not set. |

Two things to keep in mind about thinking:

- It can take minutes per component on modest hardware. Raise `timeout` accordingly, or set `think` to `false` for speed.
- Requesting it from a model that doesn't support thinking makes Ollama reject the request.

### `filter`

**Required.** One object per component type: `cpu`, `gpu`, `ssd` and `hdd`. A type that is missing, or whose `enable` is not `true`, is skipped. The filter is applied to the PassMark list, before anything is requested from idealo.

Keys such as `sort.by` or `year.min` are plain key names that contain a dot, not nested objects.

Keys common to all component types:

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `enable` | boolean | `false` | Process this component type. |
| `sort.by` | string | — | Field by which the filtered components are sorted before `limit` is applied (see below). Without it they keep PassMark's own order, which is alphabetical by name. |
| `sort.direction` | `"asc"` or `"desc"` | `"asc"` | Sort direction. Anything other than the exact value `"desc"` sorts in ascending order. |
| `limit` | number | no limit | Keep only the first _N_ components after sorting; only these are looked up on idealo. Use a whole number of at least 1, or leave the key out for no limit. |
| `year.min` / `year.max` | number | — | Range for the year of the component's first benchmark on PassMark (the _Test Date_ column). |

Additional keys for `cpu`:

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `category` | string | — | Text that the PassMark category must contain, for example `"Desktop"`. PassMark's CPU categories include `Desktop`, `Laptop`, `Server` and `Mobile/Embedded`. |
| `sockets` | string[] | — | Accepted sockets. Each entry must be identical to a value of PassMark's _Socket_ column, for example `["AM5", "AM5 (LGA 1718)", "FCLGA1851"]` (see below). |
| `cpumark.min` / `cpumark.max` | number | — | CPU Mark range. |

Additional keys for `gpu`:

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `category` | string | — | Text that the PassMark category must contain, for example `"Desktop"`. PassMark's video card categories include `Desktop`, `Mobile` and `Workstation`. |
| `vram.min` / `vram.max` | number | — | Video memory range, in MB (16 GB = 16384 MB). The cards whose memory size PassMark doesn't report (almost half of its list) count as `-1`: they never pass a `vram.min` and always pass a `vram.max` used on its own. |
| `g3d.min` / `g3d.max` | number | — | G3D Mark range. |

Additional keys for `ssd` and `hdd`:

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `size.min` / `size.max` | number | — | Capacity range, in GB, as reported by PassMark (see below). |
| `diskmark.min` / `diskmark.max` | number | — | Disk Mark range. |

How filters behave:

- **Ranges** — `*.min` is inclusive and `*.max` is exclusive: `"year.min": 2022, "year.max": 2025` keeps 2022, 2023 and 2024.
- **Text** — `category` and `sockets` are case-sensitive. `category` only has to be contained in PassMark's value, whereas a socket must be identical to it. A component can belong to several categories (`Desktop, Server`): it is kept if any of them contains your text.
- **Sockets** — PassMark doesn't always spell a socket the same way: at the time of writing, AM5 processors are listed partly as `AM5` and partly as `AM5 (LGA 1718)`, and LGA 1700 ones as `FCLGA1700`, `LGA 1700` or `LGA1700`. Look at the _Socket_ column of the [CPU Mega List](https://www.cpubenchmark.net/CPU_mega_page.html) and list every spelling you need; the names offered by PassMark's own socket filter are not always the values of that column. Processors whose socket PassMark doesn't know are listed as `Unknown`.
- **Year** — the year is the one in which PassMark received the first benchmark of the component. It is usually close to the release year, but it can be later, especially for drives.
- **Sorting and limiting** — `sort.by` and `limit` decide _which_ components are looked up, which keeps long runs under control: `"sort.by": "normCpumark", "sort.direction": "desc", "limit": 20` means "only the 20 fastest CPUs that pass the filter". The output files are always ranked by ratio, whatever the sort order.
- **Sort fields** — use the numeric fields computed by the tool: `normCpumark` (CPU), `normG3d` and `normVram` (GPU), `normDiskmark` and `normSize` (SSD and HDD), and `normYear` (all types). The original PassMark fields can be used too, but most of them are text and are compared alphabetically. Field names are case-sensitive and are not checked: with a name that doesn't exist, nothing is sorted and no error is shown.
- **Drive capacity** — PassMark reports capacities in binary units, so they are lower than the ones printed on the box: a 2 TB drive shows up as about 1843 or 1946 GB, a 4 TB drive as about 3686 or 3789 GB, an 8 TB drive as about 7475 GB. Set `size.min` roughly 10% below the nominal capacity: `1800` for "2 TB and up", `7000` for "8 TB and up".

### `scraping`

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `legacySearch` | boolean | `false` | Look for candidate products in idealo's search suggestions (up to 100) instead of its category search page. |
| `priceIncludingShipping` | boolean | `false` | When `true`, use the best total price, shipping included. Otherwise use the price of the first offer listed on the product page (normally the cheapest), without shipping. |

### `out`

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | string | `"out"` | Output directory. It is created if it doesn't exist. Give the tool a directory of its own, because `--cleanup` deletes it with everything in it. On Windows, write the path with forward slashes or doubled backslashes (`"C:/pbc/out"` or `"C:\\pbc\\out"`): a single backslash is an escape character in JSON. |
| `filename` | string | `"{TYPE}s-{DATE}"` | File name template, without extension (see the placeholders below). |
| `json` | boolean | `false` | Write a JSON file. |
| `csv` | boolean | `false` | Write a CSV file. |
| `txt` | boolean | `false` | Write a text file. |
| `plot` | boolean | `false` | Write a PNG scatter plot. |

No files are written unless at least one format is enabled.

Placeholders available in `filename`:

| Placeholder | Replaced with |
| --- | --- |
| `{TYPE}` | The component type: `cpu`, `gpu`, `ssd` or `hdd`. |
| `{REGION}` | The region being processed, for example `it`. |
| `{DATE}` | The date and time (UTC) of the export, for example `2026-11-22T01-23-45-678Z`. |

With the default template every run adds new, timestamped files (`cpus-2026-11-22T01-23-45-678Z.json`, …) and nothing is overwritten. With a fixed name such as `{TYPE}s`, a run replaces the files of the previous one (`cpus.json`, …), which is handy when you only care about the latest results. Only the component types that got at least one price are written, though: if a run finds nothing for a type, its old files stay where they are. With more than one region, add `{REGION}` to the template (for example `{TYPE}s-{REGION}` or `{TYPE}s-{REGION}-{DATE}`): with a fixed name the regions would overwrite each other, and with the default one nothing in the file names or in the plots tells the regions apart.

### `loop`

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `enable` | boolean | `false` | When a run is finished, start over, until the tool is stopped. |
| `interval` | number | `0` | Seconds to wait between the end of a run and the start of the next one (`86400` is one day). Keep it below `2147483` (about 24.8 days): with a larger value there is no wait at all. |

The pause comes on top of the time a run takes: with `86400`, the results are refreshed every 24 hours plus the duration of a run, not at the same time every day.

The config file is read once at startup: restart the tool to apply changes. Likewise, `--cleanup` only deletes the output directory at startup, not before every run.

## Output

When a region has been fully processed, the tool writes one file per enabled format, for every component type with at least one priced product, into `out.dir`:

| File | Content |
| --- | --- |
| `<name>.json` | All the products with all their fields, best ratio first. |
| `<name>.csv` | The same data as a CSV table with a header row. |
| `<name>.txt` | A readable summary: product name, idealo link, score, price and ratio. |
| `<name>.png` | A 1200×900 scatter plot with the score on the X axis, the price on the Y axis and a label for each product. |

This is what the text file looks like:

```text
AMD Ryzen 5 7600X
https://www.idealo.it/confronta-prezzi/202114973/amd-ryzen-5-7600x.html
CPU Mark: 28254; Price: 105.17; Ratio: 268.7

Intel Core Ultra 5 250KF Plus
https://www.idealo.it/confronta-prezzi/209883741/intel-core-ultra-5-250kf-plus.html
CPU Mark: 50814; Price: 207; Ratio: 245.5
```

In the JSON and CSV files, each product keeps all the fields of its PassMark entry (`name`, `cpumark`, `socket`, `cat`, `date`, …) and gains the following ones:

| Field | Description |
| --- | --- |
| `objType` | Component type: `cpu`, `gpu`, `ssd` or `hdd`. |
| `normYear` | Year taken from the PassMark date. |
| `normCpumark` / `normG3d` / `normDiskmark` | The PassMark score as a number (CPUs / GPUs / SSDs and HDDs). |
| `normVram` | GPUs only: video memory in MB (`-1` when unknown). |
| `normSize` | SSDs and HDDs only: capacity in GB. |
| `idealoName` | Name of the product on idealo. |
| `idealoUrl` | Address of the product page on idealo. |
| `idealoPrice` | Price found on idealo, in the currency of the region. |
| `ratio` | Score divided by `idealoPrice`: the higher, the better the deal. |

Don't confuse `idealoPrice` and `ratio` with `price` and `value`: the latter two come from PassMark and refer to its own price in US dollars.

In the plot, the best deals are the points towards the bottom right: high score, low price.

## Good to know

- **Double-check before you buy.** Products are matched by name, either by an LLM or by you, and the benchmark lists are built from user submissions: neither the matches nor the lists are infallible. Every result comes with its idealo link, so open it and make sure that the product (and, for drives, its capacity) is the one you expect.
- **Runs can take a while.** Each component costs one search plus one page per matched product, pages are loaded one at a time, and a thinking model adds its own time. Start with a small `limit` and widen the filters gradually.
- **Failures don't stop a run.** A request that fails (a page that doesn't load, an unexpected page, an error from Ollama) is retried up to three times and then given up; the run goes on and the files are written with what was found. The crawler's last line, `Finished! Total N requests: X succeeded, Y failed.`, tells you how many requests were given up. Components without search results or without a match, and products without offers, don't count as failures: they only leave a line in the log (see [Troubleshooting](#troubleshooting)).
- **Not every match ends up in the results.** A matched product is left out when it has no offers, when its page keeps failing, and also when its address has already come up in the same region: each address is looked up only once per region, so a product matched to two components is priced for the first one only. Likewise, the search results that idealo serves as a form instead of a link all share one address, so only the first of them in each region is looked up. Nothing is reported for the products left out because of a shared address.
- **Stopping the tool.** Press <kbd>Ctrl</kbd>+<kbd>C</kbd>. The tool normally exits within a few seconds, with a few caveats:
  - Depending on what the tool was doing at that moment, the products priced so far in the current region may still be written to the output directory. Such incomplete files replace the previous ones if `out.filename` has no `{DATE}`.
  - If the crawler was idle (for example while it waited for the per-minute budget), only the current region is cut short, and the tool may carry on with the next region or run: press <kbd>Ctrl</kbd>+<kbd>C</kbd> again if it keeps going.
  - At an open checkbox list (matching without Ollama), <kbd>Ctrl</kbd>+<kbd>C</kbd> only dismisses that list: the tool goes on with the next component and comes back to the dismissed one later. To stop the tool, press <kbd>Ctrl</kbd>+<kbd>C</kbd> again right away, before the next list opens.
  - Ignore the `CRAWLEE_PURGE_ON_START=0` hint that the crawler prints: an interrupted run can't be resumed, because results are only kept in memory until they are written, and with that setting the next run skips whatever had already been processed.
- **Long-running loops.** Every run leaves behind some memory that is never released (roughly 20–25 MB per region and run), so a tool that keeps looping eventually stops with `JavaScript heap out of memory`: after 200 runs at most with Node's default memory limit, and sooner with more than one region or on a machine with less than 16 GB of memory. Restart the tool from time to time, or leave `loop` disabled and start single runs from a scheduler such as cron or the Windows Task Scheduler.
- **The `storage` directory** that appears in the working directory holds the crawler's working data. It is not part of the results and can be deleted when the tool is not running.
- **Scraping depends on the sources.** If PassMark or idealo change their pages, the tool may stop finding data until it is updated.

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| A `WARN` line right after startup saying that the `browser` option of ImpitHttpClient `overrides the browser fingerprint of the session` | Nothing: the tool sets that option itself, and the crawler prints the warning once every time the tool is started. |
| `TypeError: Cannot read properties of undefined` at startup | The config is incomplete: `reading 'join'` means that `regions` is missing, `reading 'cpu'` that `filter` is missing, and `reading 'locale'` that a region is not one of the five supported codes. |
| `fetch failed` after `Asking <model>...` and the printed prompt | Right away: the Ollama server can't be reached at `ollama.host` (is it running, is the port included, does it accept connections from other machines?). After a long wait: the answer took longer than `ollama.timeout`; raise it, or set `ollama.think` to `false`. |
| `model '<name>' not found` | Pull the model on the Ollama server: `ollama pull <name>`. |
| `does not support thinking` | Remove `think` from the config, or set it to `false`. |
| `Unexpected Idealo search results page structure` or `Unexpected Idealo product page structure` | The page didn't look as expected: idealo may have changed its layout, or answered with something other than the requested page. Try again later with a lower `crawler.maxReqsPerMin`; for the search step you can also try `scraping.legacySearch`. |
| `Request blocked - received 403 status code.` | The site refused the request. Try again later with a lower `crawler.maxReqsPerMin`. |
| `Failed to launch browser` | The browsers are missing: run `npx playwright install` (on Linux, see [Installation](#installation)). |
| `impit couldn't load native bindings` on Windows | Install the [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-US/cpp/windows/latest-supported-vc-redist?view=msvc-170). |
| The tool waits forever in an unattended run | Without Ollama the tool waits for you to select the matches in the terminal. Enable `ollama` for unattended runs. |
| No files in the output directory | No output format is enabled in `out`, or no product was priced. In the second case the console shows where things stopped. If the `Scraping CPUs...`, `Scraping GPUs...` and `Scraping SSDs/HDDs...` lines are not followed by any `Scraping Idealo …` line, no component passed your filters: check the spelling and case of `category` and `sockets`, and the ranges. Otherwise look for `No search results :c` (`No suggestions :c` with `scraping.legacySearch`), `No selection :c` (nothing was matched) and `Not available :c` (no offers). |

## Disclaimer

This project is not affiliated with, or endorsed by, PassMark Software or idealo. It reads publicly accessible pages of their websites in an automated way, and their terms of use may restrict automated access and the reuse of their data. Read those terms (PassMark's are [here](https://www.passmark.com/legal/disclaimer.php)), keep the request rate low and use the tool responsibly.

## Built with

- [Crawlee](https://crawlee.dev/) and [Playwright](https://playwright.dev/) — crawling and browser automation
- [Ollama](https://ollama.com/) — LLM server for product matching
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) — interactive selection
- [Chart.js](https://www.chartjs.org/) and [node-canvas](https://github.com/Automattic/node-canvas) — plots
- [Commander](https://github.com/tj/commander.js) — command line interface

## License

[ISC](https://spdx.org/licenses/ISC.html), as declared in [`package.json`](package.json).
