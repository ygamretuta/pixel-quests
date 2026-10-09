"use client";

import { saveQuest } from "@/features/quests/manage-actions";
import { MONSTERS } from "@/features/monsters/data/monsters";
import type { ManagedQuest } from "@/features/quests/types";
import { WEEKDAY_NAMES, daysFromMask } from "@/shared/lib/time/schedule";
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

          <fieldset className="quest-form__days">
            <legend className="quest-form__legend">Days (daily quests)</legend>
            {WEEKDAY_NAMES.map((name, day) => (
              <label key={name} className="quest-form__day">
                <input
                  className="quest-form__day-input"
                  type="checkbox"
                  name="days"
                  value={day}
                  defaultChecked={
                    Object.keys(values).length > 0
                      ? (values.days?.split(",") ?? []).includes(String(day))
                      : daysFromMask(quest.days).includes(day)
                  }
                />
                <span className="quest-form__day-box">{name.slice(0, 2)}</span>
              </label>
            ))}
          </fieldset>

          <TextField
            label="Reminder on her tablet (optional)"
            name="remindAt"
            type="time"
            defaultValue={values.remindAt ?? quest.remindAt ?? ""}
          />

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
