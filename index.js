(() => {
  const { React } = vendetta.metro.common;
  const { findByProps } = vendetta.metro;
  const { after } = vendetta.patcher;
  const { Forms } = vendetta.ui.components;
  const storage = vendetta.plugin.storage;
  const defaults = {
    rules: [],
    ignoreSelf: true,
    ignoreBots: true,
    filterEmbeds: true,
    filterReplies: true,
    filterEditedMessages: true,
    blurAttachments: true,
  };
  const unpatches = [];
  const revealed = new Set();
  let regexCache = new Map();

  function initialize() {
    for (const [key, value] of Object.entries(defaults)) storage[key] ??= value;
  }

  function textValues(message, includeReplies = true) {
    const values = [message?.content];
    if (storage.filterEmbeds) for (const embed of message?.embeds ?? []) {
      values.push(embed.title, embed.description, embed.author?.name, embed.footer?.text);
      for (const field of embed.fields ?? []) values.push(field.name, field.value);
    }
    if (storage.blurAttachments) for (const attachment of message?.attachments ?? []) values.push(attachment.filename, attachment.url);
    if (storage.filterReplies && includeReplies) {
      const reply = message?.referenced_message ?? message?.message_reference?.resolved;
      if (reply) values.push(...textValues(reply, false));
    }
    return values.filter((value) => typeof value === "string" && value.length);
  }

  function testRule(rule, value) {
    if (!rule.enabled || !rule.pattern) return false;
    if (rule.mode === "regex") {
      const key = `${rule.id}:${rule.pattern}:${rule.caseSensitive}`;
      if (!regexCache.has(key)) {
        try { regexCache.set(key, new RegExp(rule.pattern, rule.caseSensitive ? "" : "i")); }
        catch { regexCache.set(key, null); }
      }
      return regexCache.get(key)?.test(value) ?? false;
    }
    const [text, pattern] = rule.caseSensitive ? [value, rule.pattern] : [value.toLowerCase(), rule.pattern.toLowerCase()];
    return rule.mode === "exact" ? text === pattern : text.includes(pattern);
  }

  function matches(message, selfId) {
    if (!message || (storage.ignoreSelf && selfId && message.author?.id === selfId)) return false;
    if (storage.ignoreBots && message.author?.bot) return false;
    if (!storage.filterEditedMessages && message.edited_timestamp) return false;
    return textValues(message).some((value) => (storage.rules ?? []).some((rule) => testRule(rule, value)));
  }

  function Placeholder({ messageId, refresh }) {
    const hidden = !revealed.has(messageId);
    return React.createElement(Forms.FormRow, {
      label: hidden ? "Filtered message hidden" : "Filtered message shown",
      subLabel: hidden ? "Tap to show this message" : "Tap to hide this message",
      onPress: () => { hidden ? revealed.add(messageId) : revealed.delete(messageId); refresh?.(); },
    });
  }

  function Settings() {
    const [, redraw] = React.useState(0);
    const refresh = () => redraw((value) => value + 1);
    const set = (key, value) => { storage[key] = value; refresh(); };
    const addRule = () => { storage.rules = [...storage.rules, { id: `${Date.now()}`, pattern: "", mode: "contains", caseSensitive: false, enabled: true }]; regexCache = new Map(); refresh(); };
    return React.createElement(React.Fragment, null,
      React.createElement(Forms.FormSection, { title: "Blacklist Filter" },
        React.createElement(Forms.FormRow, { label: "Add a rule", subLabel: "Adds an empty Contains rule", onPress: addRule }),
        ...(storage.rules ?? []).map((rule) => React.createElement(Forms.FormRow, {
          key: rule.id,
          label: rule.pattern || "Empty rule",
          subLabel: `${rule.mode}${rule.caseSensitive ? " · case-sensitive" : ""} · tap to enable/disable`,
          onPress: () => { rule.enabled = !rule.enabled; storage.rules = [...storage.rules]; refresh(); },
        }))
      ),
      React.createElement(Forms.FormSection, { title: "Options" },
        ...[["ignoreSelf", "Ignore my messages"], ["ignoreBots", "Ignore bot messages"], ["filterEmbeds", "Filter embeds"], ["filterReplies", "Filter replies"], ["filterEditedMessages", "Filter edited messages"], ["blurAttachments", "Match attachment names and URLs"]].map(([key, label]) => React.createElement(Forms.FormSwitch, { key, label, value: storage[key], onValueChange: (value) => set(key, value) }))
      )
    );
  }

  function installPatch() {
    const userStore = findByProps("getCurrentUser");
    const renderer = findByProps("MessageContent", "Message");
    if (!renderer?.MessageContent) {
      console.warn("[Blacklist Filter] Message renderer was not found on this Discord build.");
      return;
    }
    unpatches.push(after("MessageContent", renderer, (args, result) => {
      const props = args[0];
      const message = props?.message;
      if (!message?.id || revealed.has(message.id) || !matches(message, userStore?.getCurrentUser?.().id)) return result;
      return React.createElement(Placeholder, { messageId: message.id, refresh: props?.forceUpdate });
    }));
  }

  return {
    onLoad() { initialize(); installPatch(); },
    onUnload() { for (const unpatch of unpatches.splice(0)) unpatch(); },
    settings: Settings,
  };
})();
