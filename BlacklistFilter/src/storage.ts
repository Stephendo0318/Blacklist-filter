import { storage as pluginStorage } from "@vendetta/plugin";
import type { FilterSettings } from "./types";

export const defaults: FilterSettings = {
  rules: [],
  ignoreSelf: true,
  ignoreBots: true,
  filterEmbeds: true,
  filterReplies: true,
  filterEditedMessages: true,
  blurAttachments: true,
};

export const storage = pluginStorage as Partial<FilterSettings>;

export function initializeStorage(): void {
  for (const [key, value] of Object.entries(defaults) as Array<[keyof FilterSettings, FilterSettings[keyof FilterSettings]]>) {
    storage[key] ??= value;
  }
}

export function getSettings(): FilterSettings {
  initializeStorage();
  return storage as FilterSettings;
}
