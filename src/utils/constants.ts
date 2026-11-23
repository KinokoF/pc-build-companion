import { NumberParser } from "@internationalized/number";
import { DefaultConfig } from "../models/config.model.js";
import { ObjType } from "../models/state.model.js";

export const DEFAULT_CONFIG: DefaultConfig = {
  out: {
    dir: "out",
    filename: "{TYPE}s-{REGION}-{DATE}",
  },
  cache: {
    memory: "2gb",
    dir: "cache",
  },
  loop: {
    interval: 0,
  },
};

export const UNSET = "<unset>";

export const REGION_DATA = {
  de: { locale: "de-DE", currency: "EUR", domain: "de" },
  fr: { locale: "fr-FR", currency: "EUR", domain: "fr" },
  at: { locale: "de-AT", currency: "EUR", domain: "at" },
  it: { locale: "it-IT", currency: "EUR", domain: "it" },
  es: { locale: "es-ES", currency: "EUR", domain: "es" },
  uk: { locale: "en-GB", currency: "GBP", domain: "co.uk" },
};

export const EN_US_NUMBER_PARSER = new NumberParser("en-US");

export const CONVERSION_TO_MB = {
  MB: 1,
  GB: 1_024,
  TB: 1_048_576,
};

export const TYPES: ObjType[] = ["cpu", "gpu", "ssd", "hdd"];

export const IDEALO_SUGGEST_LIMIT = 100;

export const IDEALO_CATS = {
  de: {
    cpu: {
      searchPath: "preisvergleich/ProductCategory/3019oE2oJ0.html",
      suggestLocation: "in CPU/Prozessoren",
    },
    gpu: {
      searchPath: "preisvergleich/ProductCategory/16073oE2oJ0.html",
      suggestLocation: "in Grafikkarten",
    },
    ssd: {
      searchPath: "preisvergleich/ProductCategory/14613oE2oJ0.html",
      suggestLocation: "in SSDs",
    },
    hdd: {
      searchPath: "preisvergleich/ProductCategory/3011oE2oJ0.html",
      suggestLocation: "in Festplatten",
    },
  },
  fr: {
    cpu: {
      searchPath: "cat/3019oE2oJ0/processeurs.html",
      suggestLocation: "dans Processeurs",
    },
    gpu: {
      searchPath: "cat/16073oE2oJ0/cartes-graphiques.html",
      suggestLocation: "dans Cartes graphiques",
    },
    ssd: {
      searchPath: "cat/14613oE2oJ0/ssd.html",
      suggestLocation: "dans SSD",
    },
    hdd: {
      searchPath: "cat/3011oE2oJ0/disques-durs.html",
      suggestLocation: "dans Disques durs",
    },
  },
  at: {
    cpu: {
      searchPath: "preisvergleich/ProductCategory/3019oE2oJ0.html",
      suggestLocation: "in CPU/Prozessoren",
    },
    gpu: {
      searchPath: "preisvergleich/ProductCategory/16073oE2oJ0.html",
      suggestLocation: "in Grafikkarten",
    },
    ssd: {
      searchPath: "preisvergleich/ProductCategory/14613oE2oJ0.html",
      suggestLocation: "in SSD-Festplatten",
    },
    hdd: {
      searchPath: "preisvergleich/ProductCategory/3011oE2oJ0.html",
      suggestLocation: "in Festplatten",
    },
  },
  it: {
    cpu: {
      searchPath: "cat/3019oE2oJ0/processori-cpu.html",
      suggestLocation: "in Processori/CPU",
    },
    gpu: {
      searchPath: "cat/16073oE2oJ0/schede-video.html",
      suggestLocation: "in Schede video",
    },
    ssd: {
      searchPath: "cat/14613oE2oJ0/ssd.html",
      suggestLocation: "in SSD",
    },
    hdd: {
      searchPath: "cat/3011oE2oJ0/hard-disk.html",
      suggestLocation: "in Hard disk",
    },
  },
  es: {
    cpu: {
      searchPath: "cat/3019oE2oJ0/cpu.html",
      suggestLocation: "en CPU",
    },
    gpu: {
      searchPath: "cat/16073oE2oJ0/tarjetas-graficas.html",
      suggestLocation: "en Tarjetas gráficas",
    },
    ssd: {
      searchPath: "cat/14613oE2oJ0/ssd.html",
      suggestLocation: "en SSD",
    },
    hdd: {
      searchPath: "cat/3011oE2oJ0/discos-duros.html",
      suggestLocation: "en Discos duros",
    },
  },
  uk: {
    cpu: {
      searchPath: "cat/3019oE2oJ0/cpus.html",
      suggestLocation: "in CPUs",
    },
    gpu: {
      searchPath: "cat/16073oE2oJ0/graphics-cards.html",
      suggestLocation: "in Graphics Cards",
    },
    ssd: {
      searchPath: "cat/14613oE2oJ0/ssd.html",
      suggestLocation: "in SSD",
    },
    hdd: {
      searchPath: "cat/3011oE2oJ0/hard-drives.html",
      suggestLocation: "in Hard Drives",
    },
  },
};

export const IDEALO_PREFIX_PATH = {
  de: "preisvergleich/OffersOfProduct",
  fr: "prix",
  at: "preisvergleich/OffersOfProduct",
  it: "confronta-prezzi",
  es: "precios",
  uk: "compare",
};

export const IDEALO_PRICE_SUFFIX = {
  de: "inkl. Versand",
  fr: "livraison incl.",
  at: "inkl. Versand",
  it: "incl. spedizione",
  es: "envío incl.",
  uk: "incl. delivery",
};

export const IDEALO_HREF_RESULTS_SELECTOR =
  ".resultList__content [href^='{IDEALO_PREFIX_URL}']";
export const IDEALO_FORM_RESULTS_SELECTOR =
  ".resultList__content [action='{IDEALO_PRG_URL}']";
export const IDEALO_NO_RESULTS_SELECTOR =
  ".resultList__content [data-testid='empty-result']";

export const IDEALO_PRICE_EXCL_SHIPPING_SELECTOR =
  "a.productOffers-listItemOfferPrice";
export const IDEALO_PRICE_INCL_SHIPPING_SELECTOR =
  "div.best-total-price-box > div.line-offer-view > a > div.productOffers-listItemOfferShippingDetails";
export const IDEALO_EMPTY_SELECTOR =
  "span.productOffers-listItemTitleInnerEmpty";

export const TYPE_TO_X_AXIS = {
  cpu: { key: "normCpumark", title: "CPU Mark" },
  gpu: { key: "normG3d", title: "G3D Mark" },
  ssd: { key: "normDiskmark", title: "Disk Mark" },
  hdd: { key: "normSize", title: "Size (GB)" },
};
