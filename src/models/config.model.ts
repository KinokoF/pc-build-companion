type Region = "de" | "fr" | "at" | "it" | "es";

interface Crawler {
  maxReqsPerMin?: number;
}

interface Ollama {
  enable?: boolean;
  host?: string;
  model: string;
  think?: boolean | "high" | "medium" | "low";
  timeout?: number;
}

export type SortDirection = "asc" | "desc";

interface BaseFilter {
  enable?: boolean;
  "sort.by"?: string;
  "sort.direction"?: SortDirection;
  limit?: number;
  "year.min"?: number;
  "year.max"?: number;
}

interface CpuFilter extends BaseFilter {
  category?: string;
  sockets?: string[];
  "cpumark.min"?: number;
  "cpumark.max"?: number;
}

interface GpuFilter extends BaseFilter {
  category?: string;
  "vram.min"?: number;
  "vram.max"?: number;
  "g3d.min"?: number;
  "g3d.max"?: number;
}

interface DriveFilter extends BaseFilter {
  "size.min"?: number;
  "size.max"?: number;
  "diskmark.min"?: number;
  "diskmark.max"?: number;
}

interface Filter {
  cpu: CpuFilter;
  gpu: GpuFilter;
  ssd: DriveFilter;
  hdd: DriveFilter;
}

interface Out {
  dir: string;
  json?: boolean;
  csv?: boolean;
  txt?: boolean;
}

export interface Config {
  region: Region;
  crawler?: Crawler;
  ollama?: Ollama;
  filter: Filter;
  out: Out;
}
