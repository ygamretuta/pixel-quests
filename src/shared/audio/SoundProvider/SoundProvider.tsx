"use client";

import { createContext, use, useRef, useState, type ReactNode } from "react";
import { useLocalStorage } from "@/shared/lib/storage/useLocalStorage";
import { SoundGate } from "@/shared/audio/SoundGate/SoundGate";

export type SoundName = "hit" | "defeat" | "coin";

type SoundContextValue = {
  play: (name: SoundName) => void;
  muted: boolean;
  toggleMute: () => void;
};

const SoundContext = createContext<SoundContextValue>({
  play: () => {},
  muted: false,
  toggleMute: () => {},
});

export const useSound = () => use(SoundContext);

const TUNES: Record<SoundName, { freq: number[]; step: number; type: OscillatorType }> = {
  hit: { freq: [330, 165], step: 0.06, type: "square" },
  defeat: { freq: [440, 554, 659, 880], step: 0.09, type: "square" },
  coin: { freq: [988, 1319], step: 0.07, type: "triangle" },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useLocalStorage("pixel-quests:muted", false);
  const audio = useRef<AudioContext | null>(null);

  function start() {
    try {
      audio.current = new AudioContext();
      void audio.current.resume();
    } catch {}
    setStarted(true);
  }

  function play(name: SoundName) {
    const ctx = audio.current;
    if (!ctx || muted) return;
    const { freq, step, type } = TUNES[name];
    freq.forEach((hz, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + index * step;
      osc.type = type;
      osc.frequency.value = hz;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + step);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + step);
    });
  }

  return (
    <SoundContext value={{ play, muted, toggleMute: () => setMuted((current) => !current) }}>
      {children}
      {!started && <SoundGate onStart={start} />}
    </SoundContext>
  );
}
