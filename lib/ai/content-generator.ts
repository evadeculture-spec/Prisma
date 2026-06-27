import "server-only";

import { hashSeed } from "./mock-data";
import {
  generateCommercialTasksMock,
  generateContentCalendar as mockGenerateContentCalendar,
  generateHashtags as mockGenerateHashtags,
  generateInstagramCaption,
  generateMetaAd,
  generateMockCampaignContent,
  generatePortalDescription as mockGeneratePortalDescription,
  generateReelScript as mockGenerateReelScript,
  generateWhatsappMessage as mockGenerateWhatsappMessage,
} from "./mock-generator";
import type {
  ContentCalendarDay,
  GeneratedCampaignContent,
  GeneratedTask,
  MetaAdContent,
  PropertyAIInput,
} from "./types";

const isRealProviderConfigured = Boolean(
  process.env.AI_PROVIDER &&
    process.env.AI_PROVIDER !== "mock" &&
    (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
);

/**
 * Real-provider call (OpenAI/Anthropic) plugs in here. Not implemented yet —
 * every exported generator below falls back to the deterministic PT-PT mock
 * content whenever this throws or no provider is configured, so a missing
 * or failing AI key never breaks the product.
 */
async function callRealProvider<T>(_input: PropertyAIInput): Promise<T> {
  throw new Error("Real AI provider not implemented yet");
}

function seedFor(input: PropertyAIInput, variant: number): number {
  return hashSeed(input.id) + variant * 97;
}

export async function generatePropertyCampaign(
  input: PropertyAIInput,
  variant = 0
): Promise<GeneratedCampaignContent> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<GeneratedCampaignContent>(input);
    } catch {
      // fall through to mock
    }
  }
  return generateMockCampaignContent(input, variant);
}

export async function generateInstagramCopy(input: PropertyAIInput, variant = 0): Promise<string> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<string>(input);
    } catch {
      // fall through to mock
    }
  }
  return generateInstagramCaption(input, seedFor(input, variant));
}

export async function generatePortalDescription(input: PropertyAIInput, variant = 0): Promise<string> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<string>(input);
    } catch {
      // fall through to mock
    }
  }
  return mockGeneratePortalDescription(input, seedFor(input, variant));
}

export async function generateWhatsappMessage(input: PropertyAIInput, variant = 0): Promise<string> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<string>(input);
    } catch {
      // fall through to mock
    }
  }
  return mockGenerateWhatsappMessage(input, seedFor(input, variant));
}

export async function generateReelScript(input: PropertyAIInput, variant = 0): Promise<string> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<string>(input);
    } catch {
      // fall through to mock
    }
  }
  return mockGenerateReelScript(input, seedFor(input, variant));
}

export async function generateHashtags(input: PropertyAIInput, variant = 0): Promise<string[]> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<string[]>(input);
    } catch {
      // fall through to mock
    }
  }
  return mockGenerateHashtags(input, seedFor(input, variant));
}

export async function generateAdCopy(input: PropertyAIInput, variant = 0): Promise<MetaAdContent> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<MetaAdContent>(input);
    } catch {
      // fall through to mock
    }
  }
  return generateMetaAd(input, seedFor(input, variant));
}

export async function generateContentCalendar(input: PropertyAIInput): Promise<ContentCalendarDay[]> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<ContentCalendarDay[]>(input);
    } catch {
      // fall through to mock
    }
  }
  return mockGenerateContentCalendar(input);
}

export async function generateCommercialTasks(input: PropertyAIInput): Promise<GeneratedTask[]> {
  if (isRealProviderConfigured) {
    try {
      return await callRealProvider<GeneratedTask[]>(input);
    } catch {
      // fall through to mock
    }
  }
  return generateCommercialTasksMock(input);
}
