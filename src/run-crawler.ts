import { Browser, ImpitHttpClient } from "@crawlee/impit-client";
import { ConcurrencySystem, PlaywrightCrawler, Statistics } from "crawlee";

import { router } from "./routes.js";
import { CONFIG } from "./utils/constants.js";

const BIG_NUM = 999_999;

export async function runCrawler() {
  const startUrls = [];

  if (CONFIG.filter.cpu.enable) {
    startUrls.push({
      url: "https://www.cpubenchmark.net/CPU_mega_page.html",
      label: "cpu-list",
    });
  }

  if (CONFIG.filter.gpu.enable) {
    startUrls.push({
      url: "https://www.videocardbenchmark.net/GPU_mega_page.html",
      label: "gpu-list",
    });
  }

  if (CONFIG.filter.ssd.enable || CONFIG.filter.hdd.enable) {
    startUrls.push({
      url: "https://www.harddrivebenchmark.net/hdd-mega-page.html",
      label: "hdd-list",
    });
  }

  const concurrencySystem = new ConcurrencySystem({
    loggingIntervalSecs: null,
    maxConcurrency: 1,
    maxTasksPerMinute: CONFIG.crawler?.maxReqsPerMin,
  });

  const crawler = new PlaywrightCrawler({
    httpClient: new ImpitHttpClient({ browser: Browser.Chrome }),
    requestHandler: router,
    requestHandlerTimeoutSecs: BIG_NUM,
    // maxRequestsPerCrawl: 5,
    statusMessageLoggingInterval: BIG_NUM,
    statistics: new Statistics({ logIntervalSecs: BIG_NUM }),
    concurrencySystem,
  });

  await concurrencySystem.start();

  await crawler.run(startUrls);

  await concurrencySystem.stop();
}
