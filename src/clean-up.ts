import { log } from "console";
import { rmSync } from "fs";
import { Config } from "./models/config.model.js";

export function cleanUp(config: Config): void {
  log(`Deleting output directory (${config.out.dir})...`);

  rmSync(config.out.dir, { force: true, recursive: true });
}
