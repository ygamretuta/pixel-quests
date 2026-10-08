"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useLocalStorage } from "../storage/useLocalStorage";
import "./sound-gate.css";

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

export const useSound = () => useContext(SoundContext);

const TUNES: Record<SoundName, { freq: number[]; step: number; type: OscillatorType }> = {
  hit: { freq: [330, 165], step: 0.06, type: "square" },
  defeat: { freq: [440, 554, 659, 880], step: 0.09, type: "square" },
  coin: { freq: [988, 1319], step: 0.07, type: "triangle" },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useLocalStorage("pixel-quests:muted", false);
  const context = useRef<AudioContext | null>(null);

  // iOS only allows audio after a user gesture, so the gate creates the context.
  const start = useCallback(() => {
    try {
      context.current = new AudioContext();
      void context.current.resume();
    } catch {}
    setStarted(true);
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      const ctx = context.current;
      if (!ctx || muted) return;
      const { freq, step, type } = TUNES[name];
      freq.forEach((hz, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + i * step;
        osc.type = type;
        osc.frequency.value = hz;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + step);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + step);
      });
    },
    [muted],
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), [setMuted]);

  return (
    <SoundContext value={{ play, muted, toggleMute }}>
      {children}
      {!started && (
        <button type="button" className="sound-gate" onClick={start}>
          <span className="sound-gate__title">Pixel Quests</span>
          <span className="sound-gate__prompt">Tap to start</span>
        </button>
      )}
    </SoundContext>
  );
}
