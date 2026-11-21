import { log } from "console";
import inquirer from "inquirer";
import { Ollama } from "ollama";
import { Config } from "./models/config.model.js";
import { NormComponent } from "./models/state.model.js";

interface Candidate {
  name: string;
  url: string;
}

export async function selectMatches(
  config: Config,
  ollama: Ollama,
  component: NormComponent,
  candidates: Candidate[],
): Promise<Candidate[]> {
  const compDetails = Object.entries(component)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  if (config.ollama?.enable) {
    log(`Asking ${config.ollama.model}...`);

    const prompt =
      "Return ONLY the comma-separated indexes of the following products that match the given component. When the component is an SSD or HDD, make sure its size appears in the product name. Return -1 if there is no match.\n\n" +
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
    });

    log("Response: " + res.message.content);

    const indexes = res.message.content.match(/^\d+(,\d+)*$/)
      ? res.message.content.split(",").map((s) => +s)
      : [];

    return candidates.filter((_, i) => indexes.includes(i));
  } else {
    log("COMPONENT DETAILS\n" + compDetails);

    const answers = await inquirer.prompt<{ candidates: Candidate[] }>([
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
