"use client";

import { addQuestPack } from "@/features/quests/manage-actions";
import { QUEST_PACKS } from "@/features/quests/data/packs";
import { describeDays } from "@/shared/lib/time/schedule";
import { FormDialog } from "@/shared/ui/FormDialog/FormDialog";
import "./PackDialog.css";

/** Add a ready-made set of quests (morning routine, school days...) in one go. */
export function PackDialog({ onClose }: { onClose: () => void }) {
  async function add(formData: FormData) {
    const packId = String(formData.get("pack") ?? "");
    const titles = formData.getAll("quest").map(String);
    if (!packId) return "Pick a pack first.";
    const result = await addQuestPack(packId, titles);
    return result.ok ? null : result.error;
  }

  return (
    <FormDialog
      title="Quest packs"
      hint="Pick a pack, then tick the quests you want. Ones she already has are skipped."
      submitLabel="Add"
      action={add}
      onClose={onClose}
    >
      {() => (
        <div className="pack-dialog">
          {QUEST_PACKS.map((pack) => (
            <fieldset key={pack.id} className="pack-dialog__pack">
              <legend className="pack-dialog__legend">
                <label className="pack-dialog__pick">
                  <input className="pack-dialog__radio" type="radio" name="pack" value={pack.id} required />
                  <span>
                    {pack.title}
                    <span className="pack-dialog__blurb">{pack.blurb}</span>
                  </span>
                </label>
              </legend>
              {pack.quests.map((quest) => (
                <label key={quest.title} className="pack-dialog__quest">
                  <input type="checkbox" name="quest" value={quest.title} defaultChecked />
                  <span>
                    {quest.title}
                    <span className="pack-dialog__meta">
                      {quest.cadence === "daily" ? describeDays(quest.days ?? 0b1111111) : "weekly boss"}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      )}
    </FormDialog>
  );
}
