import { NumberParser } from "@internationalized/number";
import untypedConfig from "../../config.json" with { type: "json" };
import { Config } from "../models/config.model.js";

export const CONFIG: Config = untypedConfig as any;

export const UNSET = "<unset>";

export const EN_US_NUMBER_PARSER = new NumberParser("en-US");
export const IT_IT_CURRENCY_PARSER = new NumberParser("it-IT", {
  style: "currency",
  currency: "EUR",
});

export const IDEALO_SUGGEST_LIMIT = 20;

export const TYPES = ["cpu", "gpu", "ssd", "hdd"];

export const REGION_TO_IDEALO = {
  de: {
    slug: "preisvergleich/OffersOfProduct",
    cats: {
      cpu: "in CPU/Prozessoren",
      gpu: "in Grafikkarten",
      ssd: "in SSDs",
      hdd: "in Festplatten",
    },
  },
  fr: {
    slug: "confronta-prezzi",
    cats: {
      cpu: "in Processori/CPU",
      gpu: "in Schede video",
      ssd: "in SSD",
      hdd: "in Hard disk",
    },
  },
  at: {
    slug: "confronta-prezzi",
    cats: {
      cpu: "in Processori/CPU",
      gpu: "in Schede video",
      ssd: "in SSD",
      hdd: "in Hard disk",
    },
  },
  it: {
    slug: "confronta-prezzi",
    cats: {
      cpu: "in Processori/CPU",
      gpu: "in Schede video",
      ssd: "in SSD",
      hdd: "in Hard disk",
    },
  },
  es: {
    slug: "confronta-prezzi",
    cats: {
      cpu: "in Processori/CPU",
      gpu: "in Schede video",
      ssd: "in SSD",
      hdd: "in Hard disk",
    },
  },
};

export const CONVERSION_TO_MB = {
  MB: 1,
  GB: 1_000,
  TB: 1_000_000,
};

export const IDEALO_PRICE_SELECTOR =
  "div.best-total-price-box > div.line-offer-view > a > div.productOffers-listItemOfferShippingDetails";
