# Blacklist Filter

A Revenge Classic / Vendetta-compatible plugin that hides messages matching user-defined rules.

## Current foundation

- Persisted, live-updating rule storage
- Contains, exact, and cached regular-expression matching
- Case-sensitive matching, bot/self exclusions, and embed/reply/edited-message content extraction
- JSON import/export with schema validation
- Placeholder card component with per-message Show/Hide
- Native settings page foundation

The renderer adapter safely logs and disables itself when a Discord update changes the internal message component. The rule engine and settings remain intact; update only `src/patches/messageRenderer.tsx` for that Discord build.

## Install during development

Host the `BlacklistFilter` directory over HTTP and add its `manifest.json` URL in Revenge's plugin manager.

On this computer, double-click `start-dev-server.bat`, keep its window open, and use the displayed address in Revenge. Your phone and computer must be connected to the same Wi-Fi network.

## Important compatibility note

Discord changes internal component names frequently. `src/patches/messageRenderer.tsx` deliberately isolates the one Discord-specific renderer lookup. Once tested on the target Discord/Revenge build, only that adapter should need adjustment.
