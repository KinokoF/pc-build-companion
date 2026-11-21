import { log } from "console";
import inquirer from "inquirer";
import { Ollama } from "ollama";
import z from "zod";
import { Config } from "./models/config.model.js";
import { NormComponent } from "./models/state.model.js";

interface Candidate {
  name: string;
}

const UINT32_ARRAY = z.uint32().array();

export async function selectMatches<T extends Candidate>(
  config: Config,
  ollama: Ollama,
  component: NormComponent,
  candidates: T[],
): Promise<T[]> {
  const compDetails = Object.entries(component)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  if (config.ollama?.enable) {
    log(`Asking ${config.ollama.model}...`);

    const prompt =
      "Return only the indexes of the following products that match the given component. When the component is an SSD or HDD, make sure its size appears in the product name. Do not return anything if there are no matches.\n\n" +
      "GIVEN COMPONENT\n" +
      compDetails +
      "\n\n" +
      "LIST OF PRODUCTS\n" +
      candidates.map((c, i) => `${i}. ${c.name}`).join("\n");

    log(prompt);

    const res = await ollama.chat({
      model: config.ollama.model,
      messages: [{ role: "user", content: prompt }],
      think: config.ollama.think,
      format: z.toJSONSchema(UINT32_ARRAY),
    });

    log("Response: " + res.message.content);

    const data = JSON.parse(res.message.content);
    const indexes = UINT32_ARRAY.parse(data);

    return candidates.filter((_, i) => indexes.includes(i));
  } else {
    log("COMPONENT DETAILS\n" + compDetails);

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
}
