"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { unlockParent } from "@/features/parent/actions";
import { PinDialog } from "@/features/parent/components/PinDialog/PinDialog";
import { approveClaim, claimQuest, dismissClaim, renameMonster } from "@/features/quests/actions";
import { LogDialog } from "@/features/quests/components/LogDialog/LogDialog";
import { MonsterCard } from "@/features/quests/components/MonsterCard/MonsterCard";
import { ParentBar } from "@/features/quests/components/ParentBar/ParentBar";
import { ProofGallery } from "@/features/quests/components/ProofGallery/ProofGallery";
import { QuestHud } from "@/features/quests/components/QuestHud/QuestHud";
import { StreakBadge } from "@/features/quests/components/StreakBadge/StreakBadge";
import type { Board, HitOutcome, QuestRow } from "@/features/quests/types";
import { GoalBar } from "@/features/rewards/components/GoalBar/GoalBar";
import { useSound } from "@/shared/audio/SoundProvider/SoundProvider";
import { nextRespawnAt } from "@/shared/lib/time/pht";
import { useNow } from "@/shared/lib/time/useNow";
import { Toast } from "@/shared/ui/Toast/Toast";
import "./QuestBoard.css";

type QuestBoardProps = { board: Board; isParent: boolean };

/** One line per good thing that just happened. */
function celebration(outcome: HitOutcome) {
  const lines: string[] = [];
  if (outcome.levelUp) lines.push(`Level up! Lv ${outcome.levelUp.level} ${outcome.levelUp.title}`);
  if (outcome.bonus) lines.push(`${outcome.bonus.streak}-day streak! +${outcome.bonus.bonus} bonus coins`);
  for (const badge of outcome.badges) lines.push(`New badge: ${badge}`);
  return lines.join(" · ");
}

export function QuestBoard({ board, isParent }: QuestBoardProps) {
  const router = useRouter();
  const now = useNow();
  const { play } = useSound();
  const [celebrations, setCelebrations] = useState<Record<string, number>>({});
  const [pinOpen, setPinOpen] = useState(false);
  const [logging, setLogging] = useState<QuestRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  // When a respawn time passes while the app is open, reload the data (monsters are back).
  const nextReset = Math.min(nextRespawnAt("daily", board.asOf), nextRespawnAt("weekly", board.asOf));
  useEffect(() => {
    if (now && now >= nextReset) router.refresh();
  }, [now, nextReset, router]);

  function show(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 5000);
  }

  function onLogged(questId: string, outcome: HitOutcome) {
    setCelebrations((current) => ({ ...current, [questId]: (current[questId] ?? 0) + 1 }));
    if (outcome.defeated) {
      play("defeat");
      play("coin");
    } else {
      play("hit");
    }
    const message = celebration(outcome);
    if (message) show(message);
  }

  function claim(quest: QuestRow) {
    startTransition(async () => {
      const result = await claimQuest(quest.id);
      if (result.ok) {
        play("coin");
        show("Great job! A grown-up will check.");
      } else if (result.error === "sleeping") {
        show("Shh! It's bedtime.");
      }
    });
  }

  function approve(quest: QuestRow) {
    startTransition(async () => {
      const result = await approveClaim(quest.id);
      if (result.ok) onLogged(quest.id, result);
    });
  }

  const waitingClaims = board.quests.filter((quest) => quest.claimed).length;
  const title = board.children.length > 1 ? `${board.child.name}'s Quests` : "Today's Quests";

  return (
    <main className="quest-board">
      <QuestHud
        coins={board.coins}
        equipped={board.equipped}
        isParent={isParent}
        onUnlock={() => setPinOpen(true)}
      />

      {isParent && (
        <ParentBar
          restToday={board.streak.restToday}
          pendingRewards={board.pendingRewards}
          waitingClaims={waitingClaims}
          kids={board.children}
          currentChildId={board.child.id}
        />
      )}

      <StreakBadge days={board.streak.current} shields={board.streak.shields} level={board.level} />

      {board.goal && <GoalBar goal={board.goal} coins={board.coins} />}

      {board.streak.restToday && (
        <p className="quest-board__rest">Rest day! Your streak is safe. You can still fight if you want.</p>
      )}

      <h1 className="quest-board__title">{title}</h1>
      {board.quests.length === 0 && (
        <p className="quest-board__empty">
          {isParent ? "No quests today. Add some in Quests." : "No quests today. Enjoy your day!"}
        </p>
      )}
      <div className="quest-board__grid">
        {board.quests.map((quest) => (
          <MonsterCard
            key={quest.id}
            quest={quest}
            now={now}
            isParent={isParent}
            celebrate={celebrations[quest.id] ?? 0}
            onRename={renameMonster}
            onLog={setLogging}
            onClaim={claim}
            onApprove={approve}
            onDismiss={(target) => startTransition(() => dismissClaim(target.id))}
            busy={busy}
          />
        ))}
      </div>

      {isParent && board.evidence.length > 0 && <ProofGallery evidence={board.evidence} />}

      {toast && <Toast message={toast} />}

      {pinOpen && !isParent && <PinDialog onSubmit={unlockParent} onClose={() => setPinOpen(false)} />}
      {logging && <LogDialog quest={logging} onClose={() => setLogging(null)} onLogged={onLogged} />}
    </main>
  );
}
