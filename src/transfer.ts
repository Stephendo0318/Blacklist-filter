import { clearRegexCache } from "./matcher";
import { getSettings, storage } from "./storage";
import type { FilterRule, FilterSettings, MatchMode } from "./types";

const modes: MatchMode[] = ["contains", "exact", "regex"];

function isRule(value: unknown): value is FilterRule {
  const rule = value as FilterRule;
  return !!rule && typeof rule.id === "string" && typeof rule.pattern === "string" && modes.includes(rule.mode) && typeof rule.caseSensitive === "boolean" && typeof rule.enabled === "boolean";
}

export function exportSettings(): string {
  return JSON.stringify({ version: 1, ...getSettings() }, null, 2);
}

export function importSettings(input: string): void {
  const parsed = JSON.parse(input) as Partial<FilterSettings>;
  if (!Array.isArray(parsed.rules) || !parsed.rules.every(isRule)) throw new Error("Import must contain a valid rules array.");
  storage.rules = parsed.rules;
  for (const key of ["ignoreSelf", "ignoreBots", "filterEmbeds", "filterReplies", "filterEditedMessages", "blurAttachments"] as const) {
    if (typeof parsed[key] === "boolean") storage[key] = parsed[key];
  }
  clearRegexCache();
}
