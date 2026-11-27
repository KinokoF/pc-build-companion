import { log } from "console";
import { Config } from "./models/config.model.js";
import { UNSET } from "./utils/constants.js";

export function printFilter(config: Config): void {
  const filter = config.filter;
  const cpu = filter.cpu;
  const gpu = filter.gpu;
  const ssd = filter.ssd;
  const hdd = filter.hdd;

  log("=== SEARCH FILTER ===\n");

  log("CPU");
  log("   Enable        : " + (cpu?.enable ?? UNSET));
  log("   Sort by       : " + (cpu?.["sort.by"] ?? UNSET));
  log("   Sort dir.     : " + (cpu?.["sort.direction"] ?? UNSET));
  log("   Limit         : " + (cpu?.limit ?? UNSET));
  log("   Year min      : " + (cpu?.["year.min"] ?? UNSET));
  log("   Year max      : " + (cpu?.["year.max"] ?? UNSET));
  log("   Category      : " + (cpu?.category ?? UNSET));
  log("   Sockets       : " + (cpu?.sockets?.join(", ") ?? UNSET));
  log("   CPU Mark min  : " + (cpu?.["cpumark.min"] ?? UNSET));
  log("   CPU Mark max  : " + (cpu?.["cpumark.max"] ?? UNSET));
  log("");

  log("GPU");
  log("   Enable        : " + (gpu?.enable ?? UNSET));
  log("   Sort by       : " + (gpu?.["sort.by"] ?? UNSET));
  log("   Sort dir.     : " + (gpu?.["sort.direction"] ?? UNSET));
  log("   Limit         : " + (gpu?.limit ?? UNSET));
  log("   Year min      : " + (gpu?.["year.min"] ?? UNSET));
  log("   Year max      : " + (gpu?.["year.max"] ?? UNSET));
  log("   Category      : " + (gpu?.category ?? UNSET));
  log("   VRAM min (MB) : " + (gpu?.["vram.min"] ?? UNSET));
  log("   VRAM max (MB) : " + (gpu?.["vram.max"] ?? UNSET));
  log("   G3D Mark min  : " + (gpu?.["g3d.min"] ?? UNSET));
  log("   G3D Mark max  : " + (gpu?.["g3d.max"] ?? UNSET));
  log("");

  log("SSD");
  log("   Enable        : " + (ssd?.enable ?? UNSET));
  log("   Sort by       : " + (ssd?.["sort.by"] ?? UNSET));
  log("   Sort dir.     : " + (ssd?.["sort.direction"] ?? UNSET));
  log("   Limit         : " + (ssd?.limit ?? UNSET));
  log("   Year min      : " + (ssd?.["year.min"] ?? UNSET));
  log("   Year max      : " + (ssd?.["year.max"] ?? UNSET));
  log("   Size min (GB) : " + (ssd?.["size.min"] ?? UNSET));
  log("   Size max (GB) : " + (ssd?.["size.max"] ?? UNSET));
  log("   Disk Mark min : " + (ssd?.["diskmark.min"] ?? UNSET));
  log("   Disk Mark max : " + (ssd?.["diskmark.max"] ?? UNSET));
  log("");

  log("HDD");
  log("   Enable        : " + (hdd?.enable ?? UNSET));
  log("   Sort by       : " + (hdd?.["sort.by"] ?? UNSET));
  log("   Sort dir.     : " + (hdd?.["sort.direction"] ?? UNSET));
  log("   Limit         : " + (hdd?.limit ?? UNSET));
  log("   Year min      : " + (hdd?.["year.min"] ?? UNSET));
  log("   Year max      : " + (hdd?.["year.max"] ?? UNSET));
  log("   Size min (GB) : " + (hdd?.["size.min"] ?? UNSET));
  log("   Size max (GB) : " + (hdd?.["size.max"] ?? UNSET));
  log("   Disk Mark min : " + (hdd?.["diskmark.min"] ?? UNSET));
  log("   Disk Mark max : " + (hdd?.["diskmark.max"] ?? UNSET));
  log("");

  log("=====================\n");
}
