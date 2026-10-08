import { MonsterCard } from "@/features/quests/MonsterCard";
import { demoQuests } from "@/features/quests/quests";
import "./page.css";

export default function Home() {
  return (
    <main className="quest-board">
      <h1 className="quest-board__title">Today&apos;s Quests</h1>
      <div className="quest-board__grid">
        {demoQuests.map((quest) => (
          <MonsterCard key={quest.id} quest={quest} />
        ))}
      </div>
    </main>
  );
}
