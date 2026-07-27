export type MatchMode = "contains" | "exact" | "regex";

export interface FilterRule {
  id: string;
  pattern: string;
  mode: MatchMode;
  caseSensitive: boolean;
  enabled: boolean;
}

export interface FilterSettings {
  rules: FilterRule[];
  ignoreSelf: boolean;
  ignoreBots: boolean;
  filterEmbeds: boolean;
  filterReplies: boolean;
  filterEditedMessages: boolean;
  blurAttachments: boolean;
}

export interface DiscordMessage {
  id?: string;
  content?: string;
  edited_timestamp?: string | null;
  author?: { id?: string; bot?: boolean };
  embeds?: Array<Record<string, unknown>>;
  referenced_message?: DiscordMessage | null;
  message_reference?: { resolved?: DiscordMessage | null };
  attachments?: Array<{ filename?: string; url?: string; content_type?: string }>;
}

export interface MatchResult {
  matched: boolean;
  rule?: FilterRule;
  source?: string;
}
