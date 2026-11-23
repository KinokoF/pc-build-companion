import { program } from "commander";
import { log } from "console";
import { sleep } from "crawlee";
import { cleanUp } from "./clean-up.js";
import { initBento } from "./init-bento.js";
import { initOllama } from "./init-ollama.js";
import { printBanner } from "./print-banner.js";
import { printFilter } from "./print-filter.js";
import { readConfig } from "./read-config.js";
import { runCrawler } from "./run-crawler.js";
import { state } from "./state.js";
import { writeFiles } from "./write-files.js";

program
  .option("-c, --cleanup", "Delete out.dir on startup")
  .argument("[config-path]", "Config file path", "config.json")
  .parse();

const config = readConfig();

printBanner(config);

printFilter(config);

if (program.opts().cleanup) {
  cleanUp(config);
}

const bento = initBento(config);
const ollama = initOllama(config);

do {
  for (const region of config.regions) {
    log(`Processing region ${region}...`);

    state.products = [];

    await runCrawler(config, region, bento, ollama);

    writeFiles(config, region);
  }

  if (config.loop.enable) {
    log(`Waiting ${config.loop.interval}s...`);

    await sleep(config.loop.interval * 1_000);
  }
} while (config.loop.enable);
