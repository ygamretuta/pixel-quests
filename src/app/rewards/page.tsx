import Link from "next/link";
import { Suspense } from "react";
import { RewardsAdmin } from "@/features/rewards/RewardsAdmin";
import { isParent } from "@/server/auth";
import { getRewardsAdmin } from "@/server/rewards";

export const metadata = { title: "Rewards · Pixel Quests" };

async function RewardsLoader() {
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
  return <RewardsAdmin {...(await getRewardsAdmin())} />;
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<p className="loading">Loading...</p>}>
      <RewardsLoader />
    </Suspense>
  );
}
