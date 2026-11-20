export type Region = "de" | "fr" | "at" | "it" | "es";

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
  cpu?: CpuFilter;
  gpu?: GpuFilter;
  ssd?: DriveFilter;
  hdd?: DriveFilter;
}

interface Scraping {
  legacySearch?: boolean;
  priceIncludingShipping?: boolean;
}

interface Out {
  dir?: string;
  filename?: string;
  json?: boolean;
  csv?: boolean;
  txt?: boolean;
  plot?: boolean;
}

interface Loop {
  enable?: boolean;
  interval?: number;
}

export interface ProvidedConfig {
  regions: Region[];
  crawler?: Crawler;
  ollama?: Ollama;
  filter: Filter;
  scraping?: Scraping;
  out: Out;
  loop?: Loop;
}

interface DefaultOut {
  dir: string;
  filename: string;
}

interface DefaultLoop {
  interval: number;
}

export interface DefaultConfig {
  out: DefaultOut;
  loop: DefaultLoop;
}

export type Config = DefaultConfig & ProvidedConfig;
