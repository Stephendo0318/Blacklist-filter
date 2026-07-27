import Settings from "./components/Settings";
import { patchMessageRenderer } from "./patches/messageRenderer";
import { initializeStorage } from "./storage";
import { findByProps } from "@vendetta/metro";

const patches = [];

export default {
  onLoad() {
    initializeStorage();
    const userStore = findByProps("getCurrentUser");
    patches.push(patchMessageRenderer(() => userStore?.getCurrentUser?.().id));
  },
  onUnload() {
    for (const unpatch of patches.splice(0)) unpatch();
  },
  settings: Settings,
};
