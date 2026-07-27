import { extractSearchableText } from "./extract";
import { getSettings } from "../storage";
import type { DiscordMessage, FilterRule, MatchResult } from "../types";

const regexCache = new Map<string, RegExp | null>();

function cacheKey(rule: FilterRule): string {
  return `${rule.id}\u0000${rule.pattern}\u0000${rule.caseSensitive}`;
}

function compiledRegex(rule: FilterRule): RegExp | null {
  const key = cacheKey(rule);
  if (regexCache.has(key)) return regexCache.get(key) ?? null;
  try {
    const regex = new RegExp(rule.pattern, rule.caseSensitive ? "" : "i");
    regexCache.set(key, regex);
    return regex;
  } catch {
    regexCache.set(key, null);
    return null;
  }
}

function doesRuleMatch(rule: FilterRule, text: string): boolean {
  if (!rule.pattern) return false;
  if (rule.mode === "regex") return compiledRegex(rule)?.test(text) ?? false;
  const [candidate, pattern] = rule.caseSensitive ? [text, rule.pattern] : [text.toLocaleLowerCase(), rule.pattern.toLocaleLowerCase()];
  return rule.mode === "exact" ? candidate === pattern : candidate.includes(pattern);
}

export function clearRegexCache(): void {
  regexCache.clear();
}

export function findMessageMatch(message: DiscordMessage, currentUserId?: string): MatchResult {
  const settings = getSettings();
  if (settings.ignoreSelf && currentUserId && message.author?.id === currentUserId) return { matched: false };
  if (settings.ignoreBots && message.author?.bot) return { matched: false };
  if (!settings.filterEditedMessages && message.edited_timestamp) return { matched: false };

  const texts = extractSearchableText(message, {
    embeds: settings.filterEmbeds,
    replies: settings.filterReplies,
    attachments: settings.blurAttachments,
  });
  for (const rule of settings.rules.filter((item) => item.enabled)) {
    for (const text of texts) {
      if (doesRuleMatch(rule, text)) return { matched: true, rule, source: text };
    }
  }
  return { matched: false };
}
