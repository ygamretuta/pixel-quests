"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { archiveQuest, saveQuest } from "./actions";
import { MONSTERS, spritesByKey } from "../monsters";
import { PixelSprite } from "@/shared/pixel/PixelSprite";
import type { ManagedQuest } from "@/server/board";
import { slime } from "../sprites";
import "./manage.css";

function openOnMount(element: HTMLDialogElement | null) {
  if (element && !element.open) element.showModal();
}

const BLANK: ManagedQuest = {
  id: "",
  title: "",
  monsterName: "",
  cadence: "daily",
  maxHp: 1,
  reward: 5,
  sprite: "slime",
};

function QuestForm({ quest, onClose }: { quest: ManagedQuest; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveQuest(formData);
      if (result.ok) onClose();
      else setError(result.error);
    });
  }

  return (
    <dialog ref={openOnMount} className="dialog manage__dialog" onClose={onClose}>
      <form className="dialog__form" onSubmit={submit}>
        <h2 className="dialog__title">{quest.id ? "Edit quest" : "New quest"}</h2>
        <input type="hidden" name="id" value={quest.id} />

        <label className="manage__field">
          <span className="manage__label">Quest</span>
          <input
            className="manage__input"
            name="title"
            defaultValue={quest.title}
            maxLength={40}
            placeholder="Brush teeth"
            required
          />
        </label>

        <fieldset className="manage__field manage__choices">
          <legend className="manage__label">How often</legend>
          {(["daily", "weekly"] as const).map((cadence) => (
            <label key={cadence} className="manage__choice">
              <input type="radio" name="cadence" value={cadence} defaultChecked={quest.cadence === cadence} />
              <span className="manage__choice-box">{cadence}</span>
            </label>
          ))}
        </fieldset>

        <div className="manage__row">
          <label className="manage__field">
            <span className="manage__label">Monster HP</span>
            <input
              className="manage__input"
              name="maxHp"
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              defaultValue={quest.maxHp}
              required
            />
          </label>
          <label className="manage__field">
            <span className="manage__label">Coins</span>
            <input
              className="manage__input"
              name="reward"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              defaultValue={quest.reward}
              required
            />
          </label>
        </div>

        <fieldset className="manage__field manage__monsters">
          <legend className="manage__label">Monster</legend>
          {MONSTERS.map((monster) => (
            <label key={monster.key} className="manage__choice">
              <input type="radio" name="sprite" value={monster.key} defaultChecked={quest.sprite === monster.key} />
              <span className="manage__choice-box manage__monster">
                <span className="manage__monster-sprite">
                  <PixelSprite sprite={monster.sprite} label="" />
                </span>
                {monster.label}
              </span>
            </label>
          ))}
        </fieldset>

        <label className="manage__field">
          <span className="manage__label">Monster name</span>
          <input
            className="manage__input"
            name="monsterName"
            defaultValue={quest.monsterName}
            maxLength={12}
            placeholder="Gloop"
          />
        </label>

        {error && <p className="dialog__error" role="alert">{error}</p>}
        <div className="dialog__actions">
          <button type="button" className="pixel-button pixel-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function QuestManager({ quests }: { quests: ManagedQuest[] }) {
  const [editing, setEditing] = useState<ManagedQuest | null>(null);
  const [pending, startTransition] = useTransition();

  function archive(quest: ManagedQuest) {
    if (!window.confirm(`Remove "${quest.title}" from the board?`)) return;
    startTransition(async () => archiveQuest(quest.id));
  }

  return (
    <main className="manage">
      <header className="manage__header">
        <Link href="/" className="pixel-button pixel-button--secondary manage__back">
          Back
        </Link>
        <button type="button" className="pixel-button" onClick={() => setEditing(BLANK)}>
          + Add quest
        </button>
      </header>

      <h1 className="manage__title">Manage quests</h1>

      {quests.length === 0 && <p className="manage__empty">No quests yet. Add the first one!</p>}

      <ul className="manage__list">
        {quests.map((quest) => (
          <li key={quest.id} className={`manage__item manage__item--${quest.cadence}`}>
            <div className="manage__thumb">
              <PixelSprite sprite={spritesByKey[quest.sprite] ?? slime} label={quest.monsterName} />
            </div>
            <div className="manage__info">
              <span className="manage__item-title">{quest.title}</span>
              <span className="manage__meta">
                {quest.cadence} · {quest.maxHp} HP · {quest.reward} coins
              </span>
            </div>
            <div className="manage__buttons">
              <button type="button" className="pixel-button" onClick={() => setEditing(quest)}>
                Edit
              </button>
              <button
                type="button"
                className="pixel-button pixel-button--secondary"
                disabled={pending}
                onClick={() => archive(quest)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && <QuestForm key={editing.id || "new"} quest={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}
