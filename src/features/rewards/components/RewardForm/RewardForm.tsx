"use client";

import { saveReward } from "@/features/rewards/actions";
import { REWARD_ICONS } from "@/features/rewards/data/icons";
import type { Reward } from "@/features/rewards/types";
import { Choice, ChoicePicture } from "@/shared/ui/Choice/Choice";
import { ChoiceGroup } from "@/shared/ui/ChoiceGroup/ChoiceGroup";
import { FormDialog } from "@/shared/ui/FormDialog/FormDialog";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { TextField } from "@/shared/ui/TextField/TextField";

type RewardFormProps = { reward: Reward; onClose: () => void };

export function RewardForm({ reward, onClose }: RewardFormProps) {
  async function save(formData: FormData) {
    const result = await saveReward(formData);
    return result.ok ? null : result.error;
  }

  return (
    <FormDialog title={reward.id ? "Edit reward" : "New reward"} submitLabel="Save" action={save} onClose={onClose}>
      {(values) => (
        <>
          <input type="hidden" name="id" value={reward.id} />

          <TextField
            label="Reward"
            name="title"
            defaultValue={values.title ?? reward.title}
            maxLength={30}
            placeholder="Ice cream"
            required
          />

          <TextField
            label="Costs (coins)"
            name="cost"
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            defaultValue={values.cost ?? reward.cost}
            required
          />

          <ChoiceGroup legend="Picture" wide>
            {REWARD_ICONS.map((icon) => (
              <Choice
                key={icon.key}
                name="icon"
                value={icon.key}
                defaultChecked={(values.icon ?? reward.icon) === icon.key}
                stacked
              >
                <ChoicePicture>
                  <PixelSprite sprite={icon.sprite} label="" />
                </ChoicePicture>
                {icon.label}
              </Choice>
            ))}
          </ChoiceGroup>
        </>
      )}
    </FormDialog>
  );
}
