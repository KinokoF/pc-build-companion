import { log } from "console";
import { stringify } from "csv/sync";
import { mkdirSync, writeFileSync } from "fs";
import { PricedProduct } from "./models/state.model.js";
import { state } from "./state.js";
import { CONFIG, TYPES } from "./utils/constants.js";

type RatioProduct = PricedProduct & { ratio: number };

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

function writeJson(products: RatioProduct[], filename: string) {
  const json = JSON.stringify(products);

  writeFileSync(`${CONFIG.out.dir}/${filename}.json`, json);
}

function writeCsv(products: RatioProduct[], filename: string) {
  const csv = stringify(products, { header: true });

  writeFileSync(`${CONFIG.out.dir}/${filename}.csv`, csv);
}

function writeTxt(products: RatioProduct[], filename: string) {
  const txt = products
    .map((p) => {
      switch (p.objType) {
        case "cpu":
          return `${p.idealoName}\n${p.idealoUrl}\nCpumark: ${p.normCpumark}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
        case "gpu":
          return `${p.idealoName}\n${p.idealoUrl}\nG3D: ${p.normG3d}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
        case "ssd":
          return `${p.idealoName}\n${p.idealoUrl}\nDiskmark: ${p.normDiskmark}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
        case "hdd":
          return `${p.idealoName}\n${p.idealoUrl}\nGB: ${p.normSize}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
      }
    })
    .join("\n\n");

  writeFileSync(`${CONFIG.out.dir}/${filename}.txt`, txt);
}

export function writeFiles() {
  log("Writing JSONs/CSVs/TXTs...");

  if (
    state.products.length &&
    (CONFIG.out.json || CONFIG.out.csv || CONFIG.out.txt)
  ) {
    mkdirSync(CONFIG.out.dir);

    const date = new Date().toISOString().replaceAll(/:|\./g, "-");

    for (const type of TYPES) {
      const filtered = state.products
        .filter((p) => p.objType === type)
        .map((p) => ({ ...p, ratio: getScore(p) / p.idealoPrice }))
        .sort((a, b) => b.ratio - a.ratio);

      if (filtered.length) {
        const filename = `${type}s-${date}`;

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
