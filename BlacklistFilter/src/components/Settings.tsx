import { React, clipboard } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { exportSettings, importSettings } from "../transfer";
import { clearRegexCache } from "../matcher";
import { getSettings, storage } from "../storage";
import type { FilterRule, MatchMode } from "../types";

const { FormSection, FormSwitch, FormRow, FormInput } = Forms;

function newRule(): FilterRule {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, pattern: "", mode: "contains", caseSensitive: false, enabled: true };
}

function RuleRow({ rule, refresh }: { rule: FilterRule; refresh: () => void }) {
  const update = (change: Partial<FilterRule>) => {
    storage.rules = getSettings().rules.map((item) => item.id === rule.id ? { ...item, ...change } : item);
    clearRegexCache();
    refresh();
  };
  return <FormSection title="Rule">
    <FormInput value={rule.pattern} placeholder="Text or regular expression" onChangeText={(pattern: string) => update({ pattern })} />
    <FormRow label={`Mode: ${rule.mode}`} subLabel="Tap to cycle Contains → Exact → Regex" onPress={() => {
      const modes: MatchMode[] = ["contains", "exact", "regex"];
      update({ mode: modes[(modes.indexOf(rule.mode) + 1) % modes.length] });
    }} />
    <FormSwitch label="Case-sensitive" value={rule.caseSensitive} onValueChange={(caseSensitive: boolean) => update({ caseSensitive })} />
    <FormSwitch label="Enabled" value={rule.enabled} onValueChange={(enabled: boolean) => update({ enabled })} />
    <FormRow label="Delete rule" onPress={() => { storage.rules = getSettings().rules.filter((item) => item.id !== rule.id); clearRegexCache(); refresh(); }} />
  </FormSection>;
}

export default function Settings() {
  const [, setVersion] = React.useState(0);
  const refresh = () => setVersion((value: number) => value + 1);
  const settings = getSettings();
  const setFlag = (key: keyof typeof settings, value: boolean) => { (storage as Record<string, unknown>)[key] = value; refresh(); };

  return <>
    <FormSection title="Matching">
      <FormSwitch label="Ignore my messages" value={settings.ignoreSelf} onValueChange={(value: boolean) => setFlag("ignoreSelf", value)} />
      <FormSwitch label="Ignore bot messages" value={settings.ignoreBots} onValueChange={(value: boolean) => setFlag("ignoreBots", value)} />
      <FormSwitch label="Filter embeds" value={settings.filterEmbeds} onValueChange={(value: boolean) => setFlag("filterEmbeds", value)} />
      <FormSwitch label="Filter replies" value={settings.filterReplies} onValueChange={(value: boolean) => setFlag("filterReplies", value)} />
      <FormSwitch label="Filter edited messages" value={settings.filterEditedMessages} onValueChange={(value: boolean) => setFlag("filterEditedMessages", value)} />
      <FormSwitch label="Match attachment names and URLs" value={settings.blurAttachments} onValueChange={(value: boolean) => setFlag("blurAttachments", value)} />
    </FormSection>
    <FormSection title="Rules">
      <FormRow label="Add rule" onPress={() => { storage.rules = [...settings.rules, newRule()]; refresh(); }} />
      {settings.rules.map((rule) => <RuleRow key={rule.id} rule={rule} refresh={refresh} />)}
    </FormSection>
    <FormSection title="Transfer">
      <FormRow label="Copy settings JSON" onPress={() => clipboard.setString(exportSettings())} />
      <FormRow label="Import JSON from clipboard" onPress={async () => { try { importSettings(await clipboard.getString()); refresh(); } catch (error) { console.warn("[Blacklist Filter] Import failed", error); } }} />
    </FormSection>
  </>;
}
