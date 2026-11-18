import { log } from "console";
import { rmSync } from "fs";
import { CONFIG } from "./utils/constants.js";

export function cleanUp() {
  if (process.argv.includes("do-clean-up")) {
    log(`Cleaning output directory (${CONFIG.out.dir})...`);

    rmSync(CONFIG.out.dir, { force: true, recursive: true });
  }
}
