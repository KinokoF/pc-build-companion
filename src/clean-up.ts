import { rmSync } from "fs";
import { CONFIG } from "./utils/constants.js";

export function cleanUp() {
  if (process.argv.includes("do-clean-up")) {
    rmSync(CONFIG.out.dir, { force: true, recursive: true });
  }
}
