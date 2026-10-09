import { Suspense } from "react";
import { isParent } from "@/features/parent/server/auth";
import { QuestBoard } from "@/features/quests/components/QuestBoard/QuestBoard";
import { getBoard } from "@/features/quests/server/board";
import { Loading } from "@/shared/ui/Loading/Loading";

async function BoardLoader() {
  // Reading the cookie first makes the rest of this render request-time.
  const parent = await isParent();
  const board = await getBoard(parent);
  return <QuestBoard board={board} isParent={parent} />;
}

export default function Home() {
  return (
    <Suspense fallback={<Loading>Loading quests...</Loading>}>
      <BoardLoader />
    </Suspense>
  );
}
