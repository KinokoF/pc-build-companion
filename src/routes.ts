import { NumberParser } from "@internationalized/number";
import { log } from "console";
import { createPlaywrightRouter, RouterHandler } from "crawlee";
import { Ollama } from "ollama";
import { Locator } from "playwright";
import { expect } from "playwright/test";
import { Config, Region } from "./models/config.model.js";
import { IdealoResponse } from "./models/idealo.model.js";
import { Cpu, Drive, Gpu, PassmarkResponse } from "./models/passmark.model.js";
import { NormComponent, Product } from "./models/state.model.js";
import { selectMatches } from "./select-matches.js";
import { state } from "./state.js";
import {
  EN_US_NUMBER_PARSER,
  IDEALO_CATS,
  IDEALO_EMPTY_SELECTOR,
  IDEALO_FORM_RESULTS_SELECTOR,
  IDEALO_HREF_RESULTS_SELECTOR,
  IDEALO_NO_RESULTS_SELECTOR,
  IDEALO_PREFIX_PATH,
  IDEALO_PRICE_EXCL_SHIPPING_SELECTOR,
  IDEALO_PRICE_INCL_SHIPPING_SELECTOR,
  IDEALO_PRICE_SUFFIX,
  IDEALO_SUGGEST_LIMIT,
  REGION_DATA,
} from "./utils/constants.js";
import { extractYear, getCompareFn, normalizeSize } from "./utils/utils.js";

function buildSearchReq(
  config: Config,
  region: Region,
  userData: NormComponent,
): any {
  const baseUrl = `https://www.idealo.${REGION_DATA[region].domain}`;

  return config.scraping?.legacySearch
    ? {
        url: `${baseUrl}/suggest?q=${userData.name}&max=${IDEALO_SUGGEST_LIMIT}`,
        label: "idealo-suggest",
        userData,
      }
    : {
        url: `${baseUrl}/${IDEALO_CATS[region][userData.objType].searchPath}?q=${userData.name}`,
        label: "idealo-search",
        userData,
      };
}

function getIdealoPrefixUrl(region: Region): string {
  return `https://www.idealo.${REGION_DATA[region].domain}/${IDEALO_PREFIX_PATH[region]}/`;
}

function existsLocator(locator: Locator): Promise<boolean> {
  return expect
    .poll(() => locator.count())
    .toBeTruthy()
    .then(
      () => true,
      () => false,
    );
}

export function getRouter(
  config: Config,
  region: Region,
  ollama: Ollama,
): RouterHandler<any> {
  const currencyParser = new NumberParser(REGION_DATA[region].locale, {
    style: "currency",
    currency: REGION_DATA[region].currency,
  });
  const router = createPlaywrightRouter();

  router.addHandler("cpu-list", async ({ sendRequest, addRequests }) => {
    log("Scraping CPUs...");

    const res: PassmarkResponse<Cpu> = await sendRequest({
      url: "https://www.cpubenchmark.net/data/?_=" + new Date().getTime(),
      headers: new Headers({
        "x-requested-with": "XMLHttpRequest",
      }),
    }).then((r) => r.json());

    const filter = config.filter.cpu!;

    const reqs = res.data
      .map((c) => {
        const normYear = extractYear(c.date);
        const normCpumark = EN_US_NUMBER_PARSER.parse(c.cpumark);

        return { ...c, normYear, normCpumark };
      })
      .filter(
        (c) =>
          (!filter["year.min"] || c.normYear >= filter["year.min"]) &&
          (!filter["year.max"] || c.normYear < filter["year.max"]) &&
          (!filter.category || c.cat.includes(filter.category)) &&
          (!filter.sockets || filter.sockets.includes(c.socket)) &&
          (!filter["cpumark.min"] || c.normCpumark >= filter["cpumark.min"]) &&
          (!filter["cpumark.max"] || c.normCpumark < filter["cpumark.max"]),
      )
      .sort(getCompareFn(filter["sort.by"] as any, filter["sort.direction"]))
      .slice(0, filter.limit)
      .map((c) => buildSearchReq(config, region, { objType: "cpu", ...c }));

    await addRequests(reqs);
  });

  router.addHandler("gpu-list", async ({ sendRequest, addRequests }) => {
    log("Scraping GPUs...");

    const res: PassmarkResponse<Gpu> = await sendRequest({
      url: "https://www.videocardbenchmark.net/data/?_=" + new Date().getTime(),
      headers: new Headers({
        "x-requested-with": "XMLHttpRequest",
      }),
    }).then((r) => r.json());

    const filter = config.filter.gpu!;

    const reqs = res.data
      .map((g) => {
        const normYear = extractYear(g.date);
        const normVram = g.memSize !== "NA" ? normalizeSize(g.memSize) : -1;
        const normG3d = EN_US_NUMBER_PARSER.parse(g.g3d);

        return { ...g, normYear, normVram, normG3d };
      })
      .filter(
        (g) =>
          (!filter["year.min"] || g.normYear >= filter["year.min"]) &&
          (!filter["year.max"] || g.normYear < filter["year.max"]) &&
          (!filter.category || g.cat.includes(filter.category)) &&
          (!filter["vram.min"] || g.normVram >= filter["vram.min"]) &&
          (!filter["vram.max"] || g.normVram < filter["vram.max"]) &&
          (!filter["g3d.min"] || g.normG3d >= filter["g3d.min"]) &&
          (!filter["g3d.max"] || g.normG3d < filter["g3d.max"]),
      )
      .sort(getCompareFn(filter["sort.by"] as any, filter["sort.direction"]))
      .slice(0, filter.limit)
      .map((g) => buildSearchReq(config, region, { objType: "gpu", ...g }));

    await addRequests(reqs);
  });

  router.addHandler("hdd-list", async ({ sendRequest, addRequests }) => {
    log("Scraping SSDs/HDDs...");

    const res: PassmarkResponse<Drive> = await sendRequest({
      url: "https://www.harddrivebenchmark.net/data/?_=" + new Date().getTime(),
      headers: new Headers({
        "x-requested-with": "XMLHttpRequest",
      }),
    }).then((r) => r.json());

    const filter = config.filter;

    const drives = res.data.map((d) => {
      const normYear = extractYear(d.date);
      const normSize = normalizeSize(d.size) / 1_024;
      const normDiskmark = EN_US_NUMBER_PARSER.parse(d.diskmark);

      return { ...d, normYear, normSize, normDiskmark };
    });
    const ssdReqs = filter.ssd?.enable
      ? drives
          .filter(
            (s) =>
              s.type === "SSD" &&
              (!filter.ssd!["year.min"] ||
                s.normYear >= filter.ssd!["year.min"]) &&
              (!filter.ssd!["year.max"] ||
                s.normYear < filter.ssd!["year.max"]) &&
              (!filter.ssd!["size.min"] ||
                s.normSize >= filter.ssd!["size.min"]) &&
              (!filter.ssd!["size.max"] ||
                s.normSize < filter.ssd!["size.max"]) &&
              (!filter.ssd!["diskmark.min"] ||
                s.normDiskmark >= filter.ssd!["diskmark.min"]) &&
              (!filter.ssd!["diskmark.max"] ||
                s.normDiskmark < filter.ssd!["diskmark.max"]),
          )
          .sort(
            getCompareFn(
              filter.ssd["sort.by"] as any,
              filter.ssd["sort.direction"],
            ),
          )
          .slice(0, filter.ssd.limit)
          .map((s) => buildSearchReq(config, region, { objType: "ssd", ...s }))
      : [];
    const hddReqs = filter.hdd?.enable
      ? drives
          .filter(
            (h) =>
              h.type === "HDD" &&
              (!filter.hdd!["year.min"] ||
                h.normYear >= filter.hdd!["year.min"]) &&
              (!filter.hdd!["year.max"] ||
                h.normYear < filter.hdd!["year.max"]) &&
              (!filter.hdd!["size.min"] ||
                h.normSize >= filter.hdd!["size.min"]) &&
              (!filter.hdd!["size.max"] ||
                h.normSize < filter.hdd!["size.max"]) &&
              (!filter.hdd!["diskmark.min"] ||
                h.normDiskmark >= filter.hdd!["diskmark.min"]) &&
              (!filter.hdd!["diskmark.max"] ||
                h.normDiskmark < filter.hdd!["diskmark.max"]),
          )
          .sort(
            getCompareFn(
              filter.hdd["sort.by"] as any,
              filter.hdd["sort.direction"],
            ),
          )
          .slice(0, filter.hdd.limit)
          .map((h) => buildSearchReq(config, region, { objType: "hdd", ...h }))
      : [];

    await addRequests([...ssdReqs, ...hddReqs]);
  });

  router.addHandler("idealo-search", async ({ request, page, addRequests }) => {
    const { label, ...component } = request.userData as NormComponent & {
      label: string;
    };

    log(`Scraping Idealo search results for ${component.name}...`);

    const hrefResultsSelector = IDEALO_HREF_RESULTS_SELECTOR.replaceAll(
      "{IDEALO_PREFIX_URL}",
      getIdealoPrefixUrl(region),
    );
    const formResultsSelector = IDEALO_FORM_RESULTS_SELECTOR.replaceAll(
      "{REGION}",
      region,
    );
    const hrefResultsLocator = page.locator(hrefResultsSelector);
    const formResultsLocator = page.locator(formResultsSelector);
    const noResultsLocator = page.locator(IDEALO_NO_RESULTS_SELECTOR);

    if (
      (await existsLocator(hrefResultsLocator)) ||
      (await existsLocator(formResultsLocator))
    ) {
      const candidates = [];

      for (const elem of await hrefResultsLocator.all()) {
        const name = await elem.innerText();
        const url = (await elem.getAttribute("href"))!;

        candidates.push({ type: "href", name, url });
      }

      for (const elem of await formResultsLocator.all()) {
        const name = await elem.innerText();
        const value = await elem.locator("input[name='value']").inputValue();

        candidates.push({ type: "form", name, value });
      }

      candidates.sort((a, b) => a.name.localeCompare(b.name));

      const selection = await selectMatches(
        config,
        ollama,
        component,
        candidates,
      );

      if (selection.length) {
        const reqs = selection.map((s) =>
          s.type === "href"
            ? {
                url: s.url,
                label: "idealo-price",
                userData: { ...component, idealoName: s.name },
              }
            : {
                url: `https://www.idealo.${region}/ipc/prg`,
                method: "POST",
                payload: `value=${s.value}`,
                label: "idealo-price",
                userData: { ...component, idealoName: s.name },
              },
        );

        await addRequests(reqs as any);
      } else {
        log("No selection :c");
      }
    } else if (await existsLocator(noResultsLocator)) {
      log("No search results :c");
    } else {
      throw new Error("Unexpected Idealo search results page structure");
    }
  });

  router.addHandler(
    "idealo-suggest",
    async ({ request, page, addRequests }) => {
      const { label, ...component } = request.userData as NormComponent & {
        label: string;
      };

      log(`Scraping Idealo suggestions for ${component.name}...`);

      const prefixUrl = getIdealoPrefixUrl(region);
      const location = IDEALO_CATS[region][component.objType].suggestLocation;

      const json = await page.locator("pre").textContent();
      const candidates = (JSON.parse(json!) as IdealoResponse).groups[0]?.items
        .filter((s) => s.url.startsWith(prefixUrl) && s.location === location)
        .map((s) => ({ name: s.titlePlain, url: s.url }))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (candidates?.length) {
        const selection = await selectMatches(
          config,
          ollama,
          component,
          candidates,
        );

        if (selection.length) {
          const reqs = selection.map((s) => ({
            url: s.url,
            label: "idealo-price",
            userData: { ...component, idealoName: s.name },
          }));

          await addRequests(reqs);
        } else {
          log("No selection :c");
        }
      } else {
        log("No suggestions :c");
      }
    },
  );

  router.addHandler("idealo-price", async ({ request, page }) => {
    const { label, ...product } = request.userData as Product & {
      label: string;
    };

    log(`Scraping Idealo price for ${product.idealoName} (${product.name})...`);

    const priceSelector = config.scraping?.priceIncludingShipping
      ? IDEALO_PRICE_INCL_SHIPPING_SELECTOR
      : IDEALO_PRICE_EXCL_SHIPPING_SELECTOR;
    const priceLocator = page.locator(priceSelector);
    const emptyLocator = page.locator(IDEALO_EMPTY_SELECTOR);

    if (await existsLocator(priceLocator)) {
      const priceLabel = await priceLocator.first().innerText();
      const priceString = priceLabel.replaceAll(
        " " + IDEALO_PRICE_SUFFIX[region],
        "",
      );
      const idealoPrice = currencyParser.parse(priceString);

      log("Price: " + idealoPrice);

      state.products.push({ ...product, idealoUrl: page.url(), idealoPrice });
    } else if (await existsLocator(emptyLocator)) {
      log("Not available :c");
    } else {
      throw new Error("Unexpected Idealo product page structure");
    }
  });

  return router;
}
