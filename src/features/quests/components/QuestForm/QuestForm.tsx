"use client";

import { saveQuest } from "@/features/quests/manage-actions";
import { MONSTERS } from "@/features/quests/data/monsters";
import type { ManagedQuest } from "@/features/quests/types";
import { Choice, ChoicePicture } from "@/shared/ui/Choice/Choice";
import { ChoiceGroup } from "@/shared/ui/ChoiceGroup/ChoiceGroup";
import { FormDialog } from "@/shared/ui/FormDialog/FormDialog";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { TextField } from "@/shared/ui/TextField/TextField";
import "./QuestForm.css";

type QuestFormProps = { quest: ManagedQuest; onClose: () => void };

export function QuestForm({ quest, onClose }: QuestFormProps) {
  async function save(formData: FormData) {
    const result = await saveQuest(formData);
    return result.ok ? null : result.error;
  }

  return (
    <FormDialog title={quest.id ? "Edit quest" : "New quest"} submitLabel="Save" action={save} onClose={onClose}>
      {(values) => (
        <>
          <input type="hidden" name="id" value={quest.id} />

          <TextField
            label="Quest"
            name="title"
            defaultValue={values.title ?? quest.title}
            maxLength={40}
            placeholder="Brush teeth"
            required
          />

          <ChoiceGroup legend="How often">
            {(["daily", "weekly"] as const).map((cadence) => (
              <Choice
                key={cadence}
                name="cadence"
                value={cadence}
                defaultChecked={(values.cadence ?? quest.cadence) === cadence}
              >
                {cadence}
              </Choice>
            ))}
          </ChoiceGroup>

          <div className="quest-form__row">
            <TextField
              label="Monster HP"
              name="maxHp"
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              defaultValue={values.maxHp ?? quest.maxHp}
              required
            />
            <TextField
              label="Coins"
              name="reward"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              defaultValue={values.reward ?? quest.reward}
              required
            />
          </div>

          <ChoiceGroup legend="Monster" wide>
            {MONSTERS.map((monster) => (
              <Choice
                key={monster.key}
                name="sprite"
                value={monster.key}
                defaultChecked={(values.sprite ?? quest.sprite) === monster.key}
                stacked
              >
                <ChoicePicture>
                  <PixelSprite sprite={monster.sprite} label="" />
                </ChoicePicture>
                {monster.label}
              </Choice>
            ))}
          </ChoiceGroup>

          <TextField
            label="Monster name"
            name="monsterName"
            defaultValue={values.monsterName ?? quest.monsterName}
            maxLength={12}
            placeholder="Gloop"
          />
        </>
      )}
    </FormDialog>
  );
}
