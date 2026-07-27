import { React } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";

const { FormRow } = Forms;
const revealed = new Set<string>();

export function isRevealed(messageId: string): boolean {
  return revealed.has(messageId);
}

export function PlaceholderCard({ messageId, onToggle }: { messageId: string; onToggle: () => void }) {
  const visible = isRevealed(messageId);
  return (
    <FormRow
      label={visible ? "Filtered message shown" : "Filtered message hidden"}
      subLabel="Matched one of your Blacklist Filter rules"
      onPress={() => {
        visible ? revealed.delete(messageId) : revealed.add(messageId);
        onToggle();
      }}
    />
  );
}
