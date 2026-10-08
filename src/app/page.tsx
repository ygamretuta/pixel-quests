import { Suspense } from "react";
import { QuestBoard } from "@/features/quests/QuestBoard";
import { isParent } from "@/server/auth";
import { getBoard } from "@/server/board";

async function BoardLoader() {
  // Reading the cookie first makes the rest of this render request-time.
  const parent = await isParent();
  const board = await getBoard(parent);
  return <QuestBoard board={board} isParent={parent} />;
}

export default function Home() {
  return (
    <Suspense fallback={<p className="loading">Loading quests...</p>}>
      <BoardLoader />
    </Suspense>
  );
}
