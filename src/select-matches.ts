import { BentoCache } from "bentocache";
import { log } from "console";
import { hash } from "crypto";
import inquirer from "inquirer";
import { Ollama } from "ollama";
import z from "zod";
import { Config } from "./models/config.model.js";
import { NormComponent } from "./models/state.model.js";

interface Candidate {
  name: string;
}

const UINT32_ARRAY = z.uint32().array();

function getCompDetails(component: NormComponent): string {
  return Object.entries(component)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

async function askOllama<T extends Candidate>(
  config: Config,
  ollama: Ollama,
  component: NormComponent,
  candidates: T[],
): Promise<T[]> {
  log(`Asking ${config.ollama!.model}...`);

  const prompt =
    "Return only the indexes of the following products that match the given component. When the component is an SSD or HDD, make sure its size appears in the product name. Do not return anything if there are no matches.\n\n" +
    "GIVEN COMPONENT\n" +
    getCompDetails(component) +
    "\n\n" +
    "LIST OF PRODUCTS\n" +
    candidates.map((c, i) => `${i}. ${c.name}`).join("\n");

  log(prompt);

  const res = await ollama.chat({
    model: config.ollama!.model,
    messages: [{ role: "user", content: prompt }],
    think: config.ollama!.think,
    format: z.toJSONSchema(UINT32_ARRAY),
  });

  log("Response: " + res.message.content);

  const data = JSON.parse(res.message.content);
  const indexes = UINT32_ARRAY.parse(data);

  return candidates.filter((_, i) => indexes.includes(i));
}

async function askUser<T extends Candidate>(
  component: NormComponent,
  candidates: T[],
): Promise<T[]> {
  log("COMPONENT DETAILS\n" + getCompDetails(component));

  const answers = await inquirer.prompt<{ candidates: T[] }>([
    {
      type: "checkbox",
      message: "Select the products that match the given component",
      name: "candidates",
      choices: candidates.map((c) => ({
        name: c.name,
        value: c,
        checked: c.name.toLowerCase() === component.name.toLowerCase(),
      })),
    },
  ]);

  return answers.candidates;
}

function sha512(data: string): string {
  return hash("sha512", data);
}

export async function selectMatches<T extends Candidate>(
  config: Config,
  bento: BentoCache<any>,
  ollama: Ollama,
  component: NormComponent,
  candidates: T[],
): Promise<T[]> {
  log("Matching component to products...");

  candidates.sort((a, b) => a.name.localeCompare(b.name));

  const ask = (toAsk: T[]) =>
    config.ollama?.enable
      ? askOllama(config, ollama, component, toAsk)
      : askUser(component, toAsk);

  if (config.cache.enable) {
    const compString = Object.values(component).join("※");
    const compHash = sha512(compString);

    const cache = bento.namespace(compHash);

    const entryPromises = candidates.map(async (c) => {
      const key = sha512(c.name);
      const match = await cache.get<boolean | undefined>({ key });

      return { candidate: c, key, match };
    });
    const entries = await Promise.all(entryPromises);

    const uncached = entries.filter((e) => e.match === undefined);
    const toAsk = uncached.map((e) => e.candidate);
    const selection = toAsk.length ? await ask(toAsk) : [];
    const selectedNames = selection.map((c) => c.name);

    const setPromises = uncached.map((e) =>
      cache.setForever({
        key: e.key,
        value: selectedNames.includes(e.candidate.name),
      }),
    );
    await Promise.all(setPromises);

    return entries
      .filter((e) => e.match ?? selectedNames.includes(e.candidate.name))
      .map((e) => e.candidate);
  }

  return ask(candidates);
}
