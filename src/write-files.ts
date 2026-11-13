import { log } from "console";
import { stringify } from "csv/sync";
import { mkdirSync, writeFileSync } from "fs";
import { PricedProduct } from "./models/state.model.js";
import { state } from "./state.js";
import { CONFIG, TYPES } from "./utils/constants.js";

function getScore(product: PricedProduct): number {
  switch (product.objType) {
    case "cpu":
      return product.normCpumark;
    case "gpu":
      return product.normG3d;
    case "ssd":
      return product.normDiskmark;
    case "hdd":
      return product.normSize;
  }
}

function writeJson(products: PricedProduct[], filename: string) {
  const json = JSON.stringify(products);

  writeFileSync(`${CONFIG.out.dir}/${filename}.json`, json);
}

function writeCsv(products: PricedProduct[], filename: string) {
  const csv = stringify(products, { header: true });

  writeFileSync(`${CONFIG.out.dir}/${filename}.csv`, csv);
}

function writeTxt(products: PricedProduct[], filename: string) {
  const txt = products
    .map((p) => {
      const ratio = getScore(p) / p.idealoPrice;

      switch (p.objType) {
        case "cpu":
          return `${p.idealoName} (cpumark: ${p.normCpumark}; price: ${p.idealoPrice}; ratio: ${ratio.toFixed(1)})`;
        case "gpu":
          return `${p.idealoName} (g3d: ${p.normG3d}; price: ${p.idealoPrice}; ratio: ${ratio.toFixed(1)})`;
        case "ssd":
          return `${p.idealoName} (diskmark: ${p.normDiskmark}; price: ${p.idealoPrice}; ratio: ${ratio.toFixed(1)})`;
        case "hdd":
          return `${p.idealoName} (GB: ${p.normSize}; price: ${p.idealoPrice}; ratio: ${ratio.toFixed(1)})`;
      }
    })
    .join("\n");

  writeFileSync(`${CONFIG.out.dir}/${filename}.txt`, txt);
}

export function writeFiles() {
  log("Writing JSONs/CSVs/TXTs...");

  if (
    state.products.length &&
    (CONFIG.out.json || CONFIG.out.csv || CONFIG.out.txt)
  ) {
    mkdirSync(CONFIG.out.dir);

    for (const type of TYPES) {
      const filtered = state.products.filter((p) => p.objType === type);

      if (filtered.length) {
        const filename = type + "s";

        if (CONFIG.out.json) {
          writeJson(filtered, filename);
        }

        if (CONFIG.out.csv) {
          writeCsv(filtered, filename);
        }

        if (CONFIG.out.txt) {
          writeTxt(filtered, filename);
        }
      }
    }
  }
}
