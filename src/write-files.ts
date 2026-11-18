import { createCanvas } from "canvas";
import { Chart, LinearScale, PointElement, ScatterController } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { log } from "console";
import { stringify } from "csv/sync";
import { formatHex } from "culori";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { ObjType, PricedProduct } from "./models/state.model.js";
import { state } from "./state.js";
import { CONFIG, TYPE_TO_X_AXIS, TYPES } from "./utils/constants.js";

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

  writeFileSync(`${CONFIG.out.dir}/${filename}.txt`, txt);
}

function writePlot(type: ObjType, products: RatioProduct[], filename: string) {
  Chart.register([ScatterController, LinearScale, PointElement]);

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
          title: { display: true, text: "Price (€)" },
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

  writeFileSync(`${CONFIG.out.dir}/${filename}.png`, png);

  chart.destroy();
}

export function writeFiles() {
  log("Writing JSONs/CSVs/TXTs/plots...");

  if (
    state.products.length &&
    (CONFIG.out.json || CONFIG.out.csv || CONFIG.out.txt || CONFIG.out.plot)
  ) {
    if (!existsSync(CONFIG.out.dir)) {
      mkdirSync(CONFIG.out.dir);
    }

    const date = new Date().toISOString().replaceAll(/:|\./g, "-");

    for (const type of TYPES) {
      const filtered = state.products
        .filter((p) => p.objType === type)
        .map((p) => ({ ...p, ratio: getScore(p) / p.idealoPrice }))
        .sort((a, b) => b.ratio - a.ratio);

      if (filtered.length) {
        const filename = CONFIG.out.filename
          ? CONFIG.out.filename
              .replaceAll("{TYPE}", type)
              .replaceAll("{DATE}", date)
          : `${type}s-${date}`;

        if (CONFIG.out.json) {
          writeJson(filtered, filename);
        }

        if (CONFIG.out.csv) {
          writeCsv(filtered, filename);
        }

        if (CONFIG.out.txt) {
          writeTxt(filtered, filename);
        }

        if (CONFIG.out.plot) {
          writePlot(type, filtered, filename);
        }
      }
    }
  }
}
