import Link from "next/link";
import { Suspense } from "react";
import { QuestManager } from "@/features/quests/manage/QuestManager";
import { isParent } from "@/server/auth";
import { getManagedQuests } from "@/server/board";

export const metadata = { title: "Manage quests · Pixel Quests" };

async function ManageLoader() {
  if (!(await isParent())) {
    return (
      <main className="manage-locked">
        <p className="loading">Parents only. Unlock parent mode with the padlock first.</p>
        <Link href="/" className="pixel-button">
          Back to quests
        </Link>
      </main>
    );
  }
  return <QuestManager quests={await getManagedQuests()} />;
}

export default function ManagePage() {
  return (
    <Suspense fallback={<p className="loading">Loading...</p>}>
      <ManageLoader />
    </Suspense>
  );
}
