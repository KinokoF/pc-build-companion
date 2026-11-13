import { cleanUp } from "./clean-up.js";
import { printBanner } from "./print-banner.js";
import { printFilter } from "./print-filter.js";
import { runCrawler } from "./run-crawler.js";
import { writeFiles } from "./write-files.js";

printBanner();

printFilter();

cleanUp();

await runCrawler();

writeFiles();
