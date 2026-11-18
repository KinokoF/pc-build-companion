import { log } from "console";
import { CONFIG, UNSET } from "./utils/constants.js";

export function printBanner() {
  const version = process.env.npm_package_version;

  log(`
█▀▀▄ ▄▀▀▀     █▀▀▄ ▄  ▄ ▀ █  ▄▄█     ▄▀▀▀  ▄▄  ▄▄▄▄  ▄▄▄   ▄▄▄  ▄▄▄  ▀  ▄▄  ▄▄▄  
█▀▀  █        █▀▀▄ █  █ █ █ █  █     █    █  █ █ █ █ █  █ █  █  █  █ █ █  █ █  █ 
▀     ▀▀▀     ▀▀▀   ▀▀▀ ▀ ▀  ▀▀▀      ▀▀▀  ▀▀  ▀ ▀ ▀ █▀▀   ▀▀▀▀ ▀  ▀ ▀  ▀▀  ▀  ▀ 
                                                     ▀                           (v. ${version})
A simple tool for retrieving scores and prices for CPUs, GPUs, SSDs, and HDDs!

====== CONFIG ======

Region             : ${CONFIG.region}

Crawler
    Max reqs/min   : ${CONFIG.crawler?.maxReqsPerMin ?? UNSET}

Ollama
    Enable         : ${CONFIG.ollama?.enable ?? UNSET}
    Host           : ${CONFIG.ollama?.host ?? UNSET}
    Model          : ${CONFIG.ollama?.model ?? UNSET}
    Think          : ${CONFIG.ollama?.think ?? UNSET}
    Timeout (s)    : ${CONFIG.ollama?.timeout ?? UNSET}

Scraping
    Incl. shipping : ${CONFIG.scraping?.priceIncludingShipping ?? UNSET}

Output
    Dir            : ${CONFIG.out.dir}
    Filename       : ${CONFIG.out.filename ?? UNSET}
    JSON           : ${CONFIG.out.json ?? UNSET}
    CSV            : ${CONFIG.out.csv ?? UNSET}
    TXT            : ${CONFIG.out.txt ?? UNSET}
    Plot           : ${CONFIG.out.plot ?? UNSET}

Loop
    Enable         : ${CONFIG.loop?.enable ?? UNSET}
    Interval (s)   : ${CONFIG.loop?.interval ?? UNSET}

====================\n`);
}
