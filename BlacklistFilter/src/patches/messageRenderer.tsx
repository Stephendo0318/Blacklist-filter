import { React } from "@vendetta/metro/common";
import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { findMessageMatch } from "../matcher";
import { PlaceholderCard, isRevealed } from "../components/PlaceholderCard";
import type { DiscordMessage } from "../types";

/**
 * The names supplied by Discord vary by app build. Keep that compatibility
 * surface here; the matcher and UI do not depend on internal Discord modules.
 */
export function patchMessageRenderer(getCurrentUserId: () => string | undefined): () => void {
  const renderer = findByProps("MessageContent", "Message") as { MessageContent?: (...args: unknown[]) => unknown } | undefined;
  if (!renderer?.MessageContent) {
    console.warn("[Blacklist Filter] Unable to find the message renderer for this Discord build.");
    return () => undefined;
  }

  return after("MessageContent", renderer, (args: unknown[], result: unknown) => {
    const props = args[0] as { message?: DiscordMessage; forceUpdate?: () => void } | undefined;
    const message = props?.message;
    const messageId = message?.id;
    if (!message || !messageId || isRevealed(messageId) || !findMessageMatch(message, getCurrentUserId()).matched) return result;
    return <PlaceholderCard messageId={messageId} onToggle={() => props?.forceUpdate?.()} />;
  });
}
