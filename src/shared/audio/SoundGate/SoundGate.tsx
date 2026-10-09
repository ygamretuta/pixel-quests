import "./SoundGate.css";

/** Full-screen "tap to start": iOS only plays audio after a user gesture. */
export function SoundGate({ onStart }: { onStart: () => void }) {
  return (
    <button type="button" className="sound-gate" onClick={onStart}>
      <span className="sound-gate__title">Pixel Quests</span>
      <span className="sound-gate__prompt">Tap to start</span>
    </button>
  );
}
