import { Cpu, Drive, Gpu } from "./passmark.model.js";

interface NormEntry {
  normYear: number;
}

interface NormCpu extends NormEntry, Cpu {
  objType: "cpu";
  normCpumark: number;
}

interface NormGpu extends NormEntry, Gpu {
  objType: "gpu";
  normVram: number;
  normG3d: number;
}

interface NormDrive extends NormEntry, Drive {
  objType: "ssd" | "hdd";
  normSize: number;
  normDiskmark: number;
}

export type NormComponent = NormCpu | NormGpu | NormDrive;

export type Product = NormComponent & { idealoName: string };

export type PricedProduct = Product & { idealoPrice: number };

export interface State {
  products: PricedProduct[];
}
