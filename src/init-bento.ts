import { BentoCache, bentostore } from "bentocache";
import { fileDriver } from "bentocache/drivers/file";
import { memoryDriver } from "bentocache/drivers/memory";
import { Config } from "./models/config.model.js";

export function initBento(config: Config): BentoCache<any> {
  return new BentoCache({
    default: "multitier",
    stores: {
      multitier: bentostore()
        .useL1Layer(memoryDriver({ maxSize: config.cache.memory }))
        .useL2Layer(fileDriver({ directory: config.cache.dir })),
    },
  });
}
