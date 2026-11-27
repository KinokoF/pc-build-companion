import { Browser, ImpitHttpClient } from "@crawlee/impit-client";
import { BentoCache } from "bentocache";
import { ConcurrencySystem, PlaywrightCrawler, Statistics } from "crawlee";
import { Ollama } from "ollama";
import { Config, Region } from "./models/config.model.js";
import { getRouter } from "./routes.js";

const BIG_NUM = 999_999;

export async function runCrawler(
  config: Config,
  region: Region,
  bento: BentoCache<any>,
  ollama: Ollama,
): Promise<void> {
  const startUrls = [];

  if (config.filter.cpu?.enable) {
    startUrls.push({
      url: "https://www.cpubenchmark.net/CPU_mega_page.html",
      label: "cpu-list",
    });
  }

  if (config.filter.gpu?.enable) {
    startUrls.push({
      url: "https://www.videocardbenchmark.net/GPU_mega_page.html",
      label: "gpu-list",
    });
  }

  if (config.filter.ssd?.enable || config.filter.hdd?.enable) {
    startUrls.push({
      url: "https://www.harddrivebenchmark.net/hdd-mega-page.html",
      label: "hdd-list",
    });
  }

  const concurrencySystem = new ConcurrencySystem({
    loggingIntervalSecs: null,
    maxConcurrency: 1,
  });

  const crawler = new PlaywrightCrawler({
    httpClient: new ImpitHttpClient({ browser: Browser.Chrome }),
    requestHandler: getRouter(config, region, bento, ollama),
    requestHandlerTimeoutSecs: BIG_NUM,
    statusMessageLoggingInterval: BIG_NUM,
    statistics: new Statistics({ logIntervalSecs: BIG_NUM }),
    concurrencySystem,
    sameDomainDelaySecs: config.crawler?.delay,
  });

  await concurrencySystem.start();

  await crawler.run(startUrls);

  await concurrencySystem.stop();
}
