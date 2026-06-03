/**
 * AI provider setup for Vercel AI SDK v6.
 *
 * Each provider is called directly with a model ID string.
 * API keys are loaded automatically from environment variables:
 *   - Google:   GOOGLE_GENERATIVE_AI_API_KEY
 *   - Groq:     GROQ_API_KEY
 *   - OpenAI:   OPENAI_API_KEY (also used for NVIDIA Nim via baseURL override)
 *   - Anthropic: ANTHROPIC_API_KEY
 */

import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

// Provider names for env-based selection
export type AIProvider = "google" | "groq" | "openai" | "anthropic";

// Register model IDs per provider so TypeScript validates them
declare global {
  interface RegisteredProviderModels {
    google: "gemini-2.0-flash" | "gemini-1.5-pro" | "gemini-1.5-flash" | `gemini-${string}`;
    groq: "mixtral-8x7b-32768" | "llama-3.1-70b-versatile" | `llama-${string}` | `mixtral-${string}`;
    openai: "nemotron-3-super-120b" | "nemotron-4-340b-instruct" | `nemotron-${string}`;
    anthropic: "claude-sonnet-4-20250514" | "claude-3-haiku-20240307" | `claude-${string}`;
  }
}

/**
 * Read default provider from env, fallback to "google".
 */
function getDefaultProvider(): AIProvider {
  const raw = process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER ??
              process.env.DEFAULT_AI_PROVIDER ??
              "google";
  return ["google", "groq", "openai", "anthropic"].includes(raw)
    ? (raw as AIProvider)
    : "google";
}

/**
 * Return a LanguageModel for a given provider and optional model ID.
 * The returned model is directly usable with streamText({ model, ... }).
 */
export function getModel(
  provider: AIProvider = getDefaultProvider(),
  modelId?: string
): LanguageModel {
  switch (provider) {
    case "google":
      return google(modelId ?? "gemini-2.0-flash");
    case "groq":
      return groq(modelId ?? "mixtral-8x7b-32768");
    case "openai": {
      // NVIDIA Nim uses an OpenAI-compatible endpoint
      const client = openai({
        apiKey: process.env.NVIDIA_NIM_API_KEY ?? process.env.OPENAI_API_KEY,
        baseURL:
          process.env.NVIDIA_NIM_BASE_URL ??
          "https://integrate.api.nvidia.com/v1",
      });
      return client(modelId ?? "nemotron-3-super-120b");
    }
    case "anthropic":
      return anthropic(modelId ?? "claude-sonnet-4-20250514");
  }
}

/** Cached default model instance, reused across requests. */
export const defaultModel = getModel();