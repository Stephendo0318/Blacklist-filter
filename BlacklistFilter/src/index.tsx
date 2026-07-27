import Settings from "./components/Settings";
import { patchMessageRenderer } from "./patches/messageRenderer";
import { initializeStorage } from "./storage";
import { findByProps } from "@vendetta/metro";

const patches: Array<() => void> = [];

export default {
  onLoad() {
    initializeStorage();
    const userStore = findByProps("getCurrentUser") as { getCurrentUser?: () => { id?: string } } | undefined;
    patches.push(patchMessageRenderer(() => userStore?.getCurrentUser?.().id));
  },
  onUnload() {
    for (const unpatch of patches.splice(0)) unpatch();
  },
  settings: Settings,
};
