import { NumberParser } from "@internationalized/number";
import { Ollama } from "ollama";
import untypedConfig from "../../config.json" with { type: "json" };
import { Config } from "../models/config.model.js";
import { ObjType } from "../models/state.model.js";
import { customFetch } from "./utils.js";

export const CONFIG = untypedConfig as Config;

export const UNSET = "<unset>";

export const REGION_DATA = {
  de: { locale: "de-DE", domain: "de" },
  fr: { locale: "fr-FR", domain: "fr" },
  at: { locale: "de-AT", domain: "at" },
  it: { locale: "it-IT", domain: "it" },
  es: { locale: "es-ES", domain: "es" },
  uk: { locale: "en-GB", domain: "co.uk" },
};

export const EN_US_NUMBER_PARSER = new NumberParser("en-US");
export const CURRENCY_PARSER = new NumberParser(
  REGION_DATA[CONFIG.region].locale,
  {
    style: "currency",
    currency: "EUR",
  },
);

export const OLLAMA = new Ollama({
  host: CONFIG.ollama?.host,
  fetch: customFetch as any,
});

export const IDEALO_SUGGEST_LIMIT = 100;

export const TYPES: ObjType[] = ["cpu", "gpu", "ssd", "hdd"];

export const IDEALO_DATA = {
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
  uk: {
    urlPrefix: "compare",
    cats: {
      cpu: "in CPUs",
      gpu: "in Graphics Cards",
      ssd: "in SSD",
      hdd: "in Hard Drives",
    },
    priceSuffix: "incl. delivery",
  },
};

export const CONVERSION_TO_MB = {
  MB: 1,
  GB: 1_024,
  TB: 1_048_576,
};

export const IDEALO_PRICE_INCL_SHIPPING_SELECTOR =
  "div.best-total-price-box > a.productOffers-listItemOfferPrice";

export const IDEALO_PRICE_EXCL_SHIPPING_SELECTOR =
  "div.best-total-price-box > div.line-offer-view > a > div.productOffers-listItemOfferShippingDetails";

export const IDEALO_EMPTY_SELECTOR =
  "span.productOffers-listItemTitleInnerEmpty";

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
