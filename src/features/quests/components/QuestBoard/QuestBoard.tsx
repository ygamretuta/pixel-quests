"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { renameMonster } from "@/features/quests/actions";
import { LogDialog } from "@/features/quests/components/LogDialog/LogDialog";
import { MonsterCard } from "@/features/quests/components/MonsterCard/MonsterCard";
import { ParentBar } from "@/features/quests/components/ParentBar/ParentBar";
import { ProofGallery } from "@/features/quests/components/ProofGallery/ProofGallery";
import { QuestHud } from "@/features/quests/components/QuestHud/QuestHud";
import { StreakBadge } from "@/features/quests/components/StreakBadge/StreakBadge";
import type { Board, QuestRow, StreakBonus } from "@/features/quests/types";
import { PinDialog } from "@/features/parent/components/PinDialog/PinDialog";
import { unlockParent } from "@/features/parent/actions";
import { useSound } from "@/shared/audio/SoundProvider/SoundProvider";
import { nextRespawnAt } from "@/shared/lib/time/pht";
import { useNow } from "@/shared/lib/time/useNow";
import { Toast } from "@/shared/ui/Toast/Toast";
import "./QuestBoard.css";

type QuestBoardProps = { board: Board; isParent: boolean };

export function QuestBoard({ board, isParent }: QuestBoardProps) {
  const router = useRouter();
  const now = useNow();
  const { play } = useSound();
  const [celebrations, setCelebrations] = useState<Record<string, number>>({});
  const [pinOpen, setPinOpen] = useState(false);
  const [logging, setLogging] = useState<QuestRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // When a respawn time passes while the app is open, reload the data (monsters are back).
  const nextReset = Math.min(nextRespawnAt("daily", board.asOf), nextRespawnAt("weekly", board.asOf));
  useEffect(() => {
    if (now && now >= nextReset) router.refresh();
  }, [now, nextReset, router]);

  function onLogged(questId: string, defeated: boolean, bonus: StreakBonus | null) {
    setCelebrations((current) => ({ ...current, [questId]: (current[questId] ?? 0) + 1 }));
    if (defeated) {
      play("defeat");
      play("coin");
    } else {
      play("hit");
    }
    if (bonus) {
      setToast(`${bonus.streak}-day streak! +${bonus.bonus} bonus coins`);
      setTimeout(() => setToast(null), 5000);
    }
  }

  return (
    <main className="quest-board">
      <QuestHud
        coins={board.coins}
        equipped={board.equipped}
        isParent={isParent}
        onUnlock={() => setPinOpen(true)}
      />

      {isParent && (
        <ParentBar restToday={board.streak.restToday} pendingRewards={board.pendingRewards} />
      )}

      <StreakBadge days={board.streak.current} />

      {board.streak.restToday && (
        <p className="quest-board__rest">Rest day! Your streak is safe. You can still fight if you want.</p>
      )}

      <h1 className="quest-board__title">Today&apos;s Quests</h1>
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
          />
        ))}
      </div>

      {isParent && board.evidence.length > 0 && <ProofGallery evidence={board.evidence} />}

      {toast && <Toast message={toast} />}

      {pinOpen && !isParent && <PinDialog onSubmit={unlockParent} onClose={() => setPinOpen(false)} />}
      {logging && (
        <LogDialog quest={logging} onClose={() => setLogging(null)} onLogged={onLogged} />
      )}
    </main>
  );
}
