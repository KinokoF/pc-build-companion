import { createCanvas } from "canvas";
import { Chart, LinearScale, PointElement, ScatterController } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { log } from "console";
import { stringify } from "csv/sync";
import { formatHex } from "culori";
import { mkdirSync, writeFileSync } from "fs";
import { Config, Region } from "./models/config.model.js";
import { ObjType, PricedProduct } from "./models/state.model.js";
import { state } from "./state.js";
import { REGION_DATA, TYPE_TO_X_AXIS, TYPES } from "./utils/constants.js";

type RatioProduct = PricedProduct & { ratio: number };

const PLOT_WIDTH = 1_200;
const PLOT_HEIGHT = 900;

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

function getCurrencySymbol(region: Region): string {
  return new Intl.NumberFormat(REGION_DATA[region].locale, {
    style: "currency",
    currency: REGION_DATA[region].currency,
  })
    .formatToParts(0)
    .find((p) => p.type === "currency")!.value;
}

function writeJson(
  config: Config,
  products: RatioProduct[],
  filename: string,
): void {
  const json = JSON.stringify(products);

  writeFileSync(`${config.out.dir}/${filename}.json`, json);
}

function writeCsv(
  config: Config,
  products: RatioProduct[],
  filename: string,
): void {
  const csv = stringify(products, { header: true });

  writeFileSync(`${config.out.dir}/${filename}.csv`, csv);
}

function writeTxt(
  config: Config,
  products: RatioProduct[],
  filename: string,
): void {
  const txt = products
    .map((p) => {
      switch (p.objType) {
        case "cpu":
          return `${p.idealoName}\n${p.idealoUrl}\nCPU Mark: ${p.normCpumark}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
        case "gpu":
          return `${p.idealoName}\n${p.idealoUrl}\nG3D Mark: ${p.normG3d}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
        case "ssd":
          return `${p.idealoName}\n${p.idealoUrl}\nDisk Mark: ${p.normDiskmark}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
        case "hdd":
          return `${p.idealoName}\n${p.idealoUrl}\nSize (GB): ${p.normSize}; Price: ${p.idealoPrice}; Ratio: ${p.ratio.toFixed(1)}`;
      }
    })
    .join("\n\n");

  writeFileSync(`${config.out.dir}/${filename}.txt`, txt);
}

function writePlot(
  config: Config,
  region: Region,
  type: ObjType,
  products: RatioProduct[],
  filename: string,
): void {
  Chart.register([ScatterController, LinearScale, PointElement]);

  const currencySymbol = getCurrencySymbol(region);

  const canvas = createCanvas(PLOT_WIDTH, PLOT_HEIGHT);
  const chart = new Chart(canvas as any, {
    type: "scatter",
    plugins: [ChartDataLabels as any],
    data: {
      datasets: [
        {
          data: products,
          parsing: {
            xAxisKey: TYPE_TO_X_AXIS[type].key,
            yAxisKey: "idealoPrice",
          },
          backgroundColor: (ctx) =>
            formatHex({
              mode: "oklch",
              l: 0.65,
              c: 0.16,
              h: ctx.dataIndex * 137.5,
            }),
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
          grace: "10%",
          title: { display: true, text: TYPE_TO_X_AXIS[type].title },
        },
        y: {
          beginAtZero: true,
          grace: "10%",
          title: { display: true, text: `Price (${currencySymbol})` },
        },
      },
      plugins: {
        datalabels: {
          align: "top",
          backgroundColor: "white",
          borderWidth: 0.4,
          borderColor: "gray",
          formatter: (value: RatioProduct) => value.idealoName,
        },
      },
    },
  });

  const ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, PLOT_WIDTH, PLOT_HEIGHT);

  const png = canvas.toBuffer();

  writeFileSync(`${config.out.dir}/${filename}.png`, png);

  chart.destroy();
}

export function writeFiles(config: Config, region: Region): void {
  log("Writing JSONs/CSVs/TXTs/plots...");

  if (
    state.products.length &&
    (config.out.json || config.out.csv || config.out.txt || config.out.plot)
  ) {
    mkdirSync(config.out.dir, { recursive: true });

    const date = new Date().toISOString().replaceAll(/:|\./g, "-");

    for (const type of TYPES) {
      const filtered = state.products
        .filter((p) => p.objType === type)
        .map((p) => ({ ...p, ratio: getScore(p) / p.idealoPrice }))
        .sort((a, b) => b.ratio - a.ratio);

      if (filtered.length) {
        const filename = config.out.filename
          .replaceAll("{TYPE}", type)
          .replaceAll("{REGION}", region)
          .replaceAll("{DATE}", date);

        if (config.out.json) {
          writeJson(config, filtered, filename);
        }

        if (config.out.csv) {
          writeCsv(config, filtered, filename);
        }

        if (config.out.txt) {
          writeTxt(config, filtered, filename);
        }

        if (config.out.plot) {
          writePlot(config, region, type, filtered, filename);
        }
      }
    }
  }
}
