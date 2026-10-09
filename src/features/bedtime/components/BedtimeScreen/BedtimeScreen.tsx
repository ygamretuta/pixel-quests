"use client";

import { useState } from "react";
import { unlockParent } from "@/features/parent/actions";
import { PinDialog } from "@/features/parent/components/PinDialog/PinDialog";
import { BedtimeWatcher } from "@/features/bedtime/components/BedtimeWatcher/BedtimeWatcher";
import { formatClock } from "@/shared/lib/time/bedtime";
import { moon } from "@/shared/lib/pixel/icons";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./BedtimeScreen.css";

type BedtimeScreenProps = { wake: string; wakeAt: number | null };

export function BedtimeScreen({ wake, wakeAt }: BedtimeScreenProps) {
  const [asking, setAsking] = useState(false);

  return (
    <main className="bedtime-screen">
      <div className="bedtime-screen__moon">
        <PixelSprite sprite={moon} label="A sleepy moon" />
      </div>
      <h1 className="bedtime-screen__title">Sleep tight!</h1>
      <p className="bedtime-screen__message">
        The monsters are asleep. Come back at {formatClock(wake)}.
      </p>
      <PixelButton variant="secondary" className="bedtime-screen__grownup" onClick={() => setAsking(true)}>
        Grown-up
      </PixelButton>

      <BedtimeWatcher at={wakeAt} />
      {asking && <PinDialog onSubmit={unlockParent} onClose={() => setAsking(false)} />}
    </main>
  );
}
