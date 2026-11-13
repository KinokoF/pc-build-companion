import { rmSync } from "fs";
import { CONFIG } from "./utils/constants.js";

export function cleanUp() {
  rmSync(CONFIG.out.dir, { force: true, recursive: true });
}
