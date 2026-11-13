import { log } from "console";
import { CONFIG, UNSET } from "./utils/constants.js";

export function printBanner() {
  log(`
█▀▀▄ ▄▀▀▀     █▀▀▄ ▄  ▄ ▀ █  ▄▄█     ▄▀▀▀  ▄▄  ▄▄▄▄  ▄▄▄   ▄▄▄  ▄▄▄  ▀  ▄▄  ▄▄▄  
█▀▀  █        █▀▀▄ █  █ █ █ █  █     █    █  █ █ █ █ █  █ █  █  █  █ █ █  █ █  █ 
▀     ▀▀▀     ▀▀▀   ▀▀▀ ▀ ▀  ▀▀▀      ▀▀▀  ▀▀  ▀ ▀ ▀ █▀▀   ▀▀▀▀ ▀  ▀ ▀  ▀▀  ▀  ▀ 
                                                     ▀                           (v. 0.2.0)
A simple tool for retrieving scores and prices for CPUs, GPUs, SSDs, and HDDs!

Region     : ${CONFIG.region}

Ollama
    Enable : ${CONFIG.ollama?.enable ?? UNSET}
    Model  : ${CONFIG.ollama?.model ?? UNSET}
    Think  : ${CONFIG.ollama?.think ?? UNSET}

Output
    Dir    : ${CONFIG.out.dir}
    JSON   : ${CONFIG.out.json ?? UNSET}
    CSV    : ${CONFIG.out.csv ?? UNSET}
    TXT    : ${CONFIG.out.txt ?? UNSET}\n`);
}
