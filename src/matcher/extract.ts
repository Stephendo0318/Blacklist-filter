import type { DiscordMessage } from "../types";

function addText(target: string[], value: unknown): void {
  if (typeof value === "string" && value.trim()) target.push(value);
}

function extractEmbedText(embed: Record<string, unknown>): string[] {
  const text: string[] = [];
  addText(text, embed.title);
  addText(text, embed.description);
  const author = embed.author as Record<string, unknown> | undefined;
  const footer = embed.footer as Record<string, unknown> | undefined;
  addText(text, author?.name);
  addText(text, footer?.text);
  for (const field of (embed.fields as Array<Record<string, unknown>> | undefined) ?? []) {
    addText(text, field.name);
    addText(text, field.value);
  }
  return text;
}

export function extractSearchableText(message: DiscordMessage, options: {
  embeds: boolean;
  replies: boolean;
  attachments: boolean;
}): string[] {
  const text: string[] = [];
  addText(text, message.content);

  if (options.embeds) {
    for (const embed of message.embeds ?? []) text.push(...extractEmbedText(embed));
  }

  if (options.replies) {
    const referenced = message.referenced_message ?? message.message_reference?.resolved;
    if (referenced) text.push(...extractSearchableText(referenced, { ...options, replies: false }));
  }

  if (options.attachments) {
    for (const attachment of message.attachments ?? []) {
      addText(text, attachment.filename);
      addText(text, attachment.url);
    }
  }

  return text;
}
