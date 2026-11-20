import { program } from "commander";
import { readFileSync } from "fs";
import _ from "lodash";
import { Config, ProvidedConfig } from "./models/config.model.js";
import { DEFAULT_CONFIG } from "./utils/constants.js";

export function readConfig(): Config {
  const json = readFileSync(program.processedArgs[0], "utf8");
  const providedConfig = JSON.parse(json) as ProvidedConfig;

  return _.merge(DEFAULT_CONFIG, providedConfig);
}
