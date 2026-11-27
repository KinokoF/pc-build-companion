import { log } from "console";
import { Config } from "./models/config.model.js";
import { UNSET } from "./utils/constants.js";

export function printBanner(config: Config): void {
  const version = process.env.npm_package_version;

  log(`
█▀▀▄ ▄▀▀▀     █▀▀▄ ▄  ▄ ▀ █  ▄▄█     ▄▀▀▀  ▄▄  ▄▄▄▄  ▄▄▄   ▄▄▄  ▄▄▄  ▀  ▄▄  ▄▄▄  
█▀▀  █        █▀▀▄ █  █ █ █ █  █     █    █  █ █ █ █ █  █ █  █  █  █ █ █  █ █  █ 
▀     ▀▀▀     ▀▀▀   ▀▀▀ ▀ ▀  ▀▀▀      ▀▀▀  ▀▀  ▀ ▀ ▀ █▀▀   ▀▀▀▀ ▀  ▀ ▀  ▀▀  ▀  ▀ 
                                                     ▀                           (v. ${version})
A CLI tool for retrieving scores and prices for CPUs, GPUs, SSDs, and HDDs!

NEW! Want to view the results via UI? Check out PC Build Companion Viewer (https://github.com/KinokoF/pbc-viewer)!

====== CONFIG ======

Regions            : ${config.regions.join(", ")}

Crawler
    Delay (s)      : ${config.crawler?.delay ?? UNSET}

Ollama
    Enable         : ${config.ollama?.enable ?? UNSET}
    Host           : ${config.ollama?.host ?? UNSET}
    Model          : ${config.ollama?.model ?? UNSET}
    Think          : ${config.ollama?.think ?? UNSET}
    Timeout (s)    : ${config.ollama?.timeout ?? UNSET}

Scraping
    Legacy search  : ${config.scraping?.legacySearch ?? UNSET}
    Incl. shipping : ${config.scraping?.priceIncludingShipping ?? UNSET}

Output
    Dir            : ${config.out.dir}
    Filename       : ${config.out.filename ?? UNSET}
    JSON           : ${config.out.json ?? UNSET}
    CSV            : ${config.out.csv ?? UNSET}
    TXT            : ${config.out.txt ?? UNSET}
    Plot           : ${config.out.plot ?? UNSET}

Cache
    Enable         : ${config.cache.enable ?? UNSET}
    Memory         : ${config.cache.memory ?? UNSET}
    Dir            : ${config.cache.dir ?? UNSET}

Loop
    Enable         : ${config.loop.enable ?? UNSET}
    Interval (s)   : ${config.loop.interval ?? UNSET}

====================\n`);
}
