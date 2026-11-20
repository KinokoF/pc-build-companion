import { Ollama } from "ollama";
import { Agent, fetch, Request, Response } from "undici";
import { Config } from "./models/config.model.js";

export function initOllama(config: Config): Ollama {
  const customFetch = (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    const someInit = init ?? {};
    const headersTimeout = config.ollama?.timeout
      ? config.ollama.timeout * 1_000
      : undefined;

    return fetch(input, {
      ...someInit,
      dispatcher: new Agent({ headersTimeout }),
    } as any);
  };

  return new Ollama({
    host: config.ollama?.host,
    fetch: customFetch as any,
  });
}
