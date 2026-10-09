import { Suspense } from "react";
import { ParentOnly } from "@/features/parent/components/ParentOnly/ParentOnly";
import { isParent } from "@/features/parent/server/auth";
import { QuestManager } from "@/features/quests/components/QuestManager/QuestManager";
import { getManagedQuests } from "@/features/quests/server/board";
import { Loading } from "@/shared/ui/Loading/Loading";

export const metadata = { title: "Manage quests · Pixel Quests" };

async function ManageLoader() {
  if (!(await isParent())) return <ParentOnly />;
  return <QuestManager quests={await getManagedQuests()} />;
}

export default function ManagePage() {
  return (
    <Suspense fallback={<Loading>Loading...</Loading>}>
      <ManageLoader />
    </Suspense>
  );
}
