"use client";

import { useState, useTransition } from "react";
import { QuestForm } from "@/features/quests/components/QuestForm/QuestForm";
import { spritesByKey } from "@/features/quests/data/monsters";
import { slime } from "@/features/quests/data/sprites";
import { archiveQuest, moveQuest, restoreQuest } from "@/features/quests/manage-actions";
import type { ManagedQuest } from "@/features/quests/types";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelButton, PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./QuestManager.css";

const BLANK: ManagedQuest = {
  id: "",
  title: "",
  monsterName: "",
  cadence: "daily",
  maxHp: 1,
  reward: 5,
  sprite: "slime",
  active: true,
};

function QuestSummary({ quest }: { quest: ManagedQuest }) {
  return (
    <>
      <div className="quest-manager__thumb">
        <PixelSprite sprite={spritesByKey[quest.sprite] ?? slime} label={quest.monsterName} />
      </div>
      <div className="quest-manager__info">
        <span className="quest-manager__name">{quest.title}</span>
        <span className="quest-manager__meta">
          {quest.cadence} · {quest.maxHp} HP · {quest.reward} coins
        </span>
      </div>
    </>
  );
}

export function QuestManager({ quests }: { quests: ManagedQuest[] }) {
  const [editing, setEditing] = useState<ManagedQuest | null>(null);
  const [pending, startTransition] = useTransition();
  const active = quests.filter((quest) => quest.active);
  const removed = quests.filter((quest) => !quest.active);

  function archive(quest: ManagedQuest) {
    if (!window.confirm(`Remove "${quest.title}" from the board?`)) return;
    startTransition(() => archiveQuest(quest.id));
  }

  return (
    <main className="quest-manager">
      <header className="quest-manager__header">
        <PixelLinkButton href="/" variant="secondary">
          Back
        </PixelLinkButton>
        <PixelButton onClick={() => setEditing(BLANK)}>+ Add quest</PixelButton>
      </header>

      <h1 className="quest-manager__title">Manage quests</h1>

      {active.length === 0 && <p className="quest-manager__empty">No quests yet. Add the first one!</p>}

      <ul className="quest-manager__list">
        {active.map((quest, index) => (
          <li
            key={quest.id}
            className={cx("quest-manager__item", panelClass(quest.cadence === "weekly" ? "highlight" : "plain"))}
          >
            <QuestSummary quest={quest} />
            <div className="quest-manager__buttons">
              <PixelButton
                variant="secondary"
                className="quest-manager__move"
                aria-label={`Move ${quest.title} up`}
                disabled={pending || index === 0}
                onClick={() => startTransition(() => moveQuest(quest.id, "up"))}
              >
                <span className="quest-manager__arrow quest-manager__arrow--up" />
              </PixelButton>
              <PixelButton
                variant="secondary"
                className="quest-manager__move"
                aria-label={`Move ${quest.title} down`}
                disabled={pending || index === active.length - 1}
                onClick={() => startTransition(() => moveQuest(quest.id, "down"))}
              >
                <span className="quest-manager__arrow quest-manager__arrow--down" />
              </PixelButton>
              <PixelButton className="quest-manager__button" onClick={() => setEditing(quest)}>
                Edit
              </PixelButton>
              <PixelButton
                variant="secondary"
                className="quest-manager__button"
                disabled={pending}
                onClick={() => archive(quest)}
              >
                Remove
              </PixelButton>
            </div>
          </li>
        ))}
      </ul>

      {removed.length > 0 && (
        <section className="quest-manager__removed">
          <h2 className="quest-manager__subtitle">Removed quests</h2>
          <ul className="quest-manager__list">
            {removed.map((quest) => (
              <li key={quest.id} className={cx("quest-manager__item quest-manager__item--removed", panelClass())}>
                <QuestSummary quest={quest} />
                <div className="quest-manager__buttons">
                  <PixelButton
                    className="quest-manager__button"
                    disabled={pending}
                    onClick={() => startTransition(() => restoreQuest(quest.id))}
                  >
                    Restore
                  </PixelButton>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && <QuestForm key={editing.id || "new"} quest={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}
