import { NumberParser } from "@internationalized/number";
import { Ollama } from "ollama";
import untypedConfig from "../../config.json" with { type: "json" };
import { Config } from "../models/config.model.js";
import { ObjType } from "../models/state.model.js";
import { customFetch } from "./utils.js";

export const CONFIG: Config = untypedConfig as any;

export const UNSET = "<unset>";

export const REGION_TO_LOCALE = {
  de: "de-DE",
  fr: "fr-FR",
  at: "de-AT",
  it: "it-IT",
  es: "es-ES",
};

export const EN_US_NUMBER_PARSER = new NumberParser("en-US");
export const CURRENCY_PARSER = new NumberParser(
  REGION_TO_LOCALE[CONFIG.region],
  {
    style: "currency",
    currency: "EUR",
  },
);

export const OLLAMA = new Ollama({
  host: CONFIG.ollama?.host,
  fetch: customFetch,
});

export const IDEALO_SUGGEST_LIMIT = 20;

export const TYPES: ObjType[] = ["cpu", "gpu", "ssd", "hdd"];

export const REGION_TO_IDEALO_DATA = {
  de: {
    urlPrefix: "preisvergleich/OffersOfProduct",
    cats: {
      cpu: "in CPU/Prozessoren",
      gpu: "in Grafikkarten",
      ssd: "in SSDs",
      hdd: "in Festplatten",
    },
    priceSuffix: "inkl. Versand",
  },
  fr: {
    urlPrefix: "prix",
    cats: {
      cpu: "dans Processeurs",
      gpu: "dans Cartes graphiques",
      ssd: "dans SSD",
      hdd: "dans Disques durs",
    },
    priceSuffix: "livraison incl.",
  },
  at: {
    urlPrefix: "preisvergleich/OffersOfProduct",
    cats: {
      cpu: "in CPU/Prozessoren",
      gpu: "in Grafikkarten",
      ssd: "in SSD-Festplatten",
      hdd: "in Festplatten",
    },
    priceSuffix: "inkl. Versand",
  },
  it: {
    urlPrefix: "confronta-prezzi",
    cats: {
      cpu: "in Processori/CPU",
      gpu: "in Schede video",
      ssd: "in SSD",
      hdd: "in Hard disk",
    },
    priceSuffix: "incl. spedizione",
  },
  es: {
    urlPrefix: "precios",
    cats: {
      cpu: "en CPU",
      gpu: "en Tarjetas gráficas",
      ssd: "en SSD",
      hdd: "en Discos duros",
    },
    priceSuffix: "envío incl.",
  },
};

export const CONVERSION_TO_MB = {
  MB: 1,
  GB: 1_024,
  TB: 1_048_576,
};

export const IDEALO_PRICE_SELECTOR =
  "div.best-total-price-box > div.line-offer-view > a > div.productOffers-listItemOfferShippingDetails";

export const TYPE_TO_X_AXIS = {
  cpu: {
    key: "normCpumark",
    title: "CPU Mark",
  },
  gpu: {
    key: "normG3d",
    title: "G3D Mark",
  },
  ssd: {
    key: "normDiskmark",
    title: "Disk Mark",
  },
  hdd: {
    key: "normSize",
    title: "Size (GB)",
  },
};
