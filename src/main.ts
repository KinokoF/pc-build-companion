import { sleep } from "crawlee";
import { cleanUp } from "./clean-up.js";
import { printBanner } from "./print-banner.js";
import { printFilter } from "./print-filter.js";
import { runCrawler } from "./run-crawler.js";
import { CONFIG } from "./utils/constants.js";
import { writeFiles } from "./write-files.js";

printBanner();

printFilter();

cleanUp();

do {
  await runCrawler();

  writeFiles();

  if (CONFIG.loop?.enable) {
    await sleep((CONFIG.loop.interval ?? 0) * 1_000);
  }
} while (CONFIG.loop?.enable);
