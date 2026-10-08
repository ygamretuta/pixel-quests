import Link from "next/link";
import { Suspense } from "react";
import { WeeklySummary } from "@/features/summary/WeeklySummary";
import { isParent } from "@/server/auth";
import { getWeekSummary } from "@/server/summary";

export const metadata = { title: "Weekly summary · Pixel Quests" };

async function SummaryLoader({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
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
  const { week } = await searchParams;
  const valid = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : null;
  return <WeeklySummary summary={await getWeekSummary(valid)} />;
}

export default function SummaryPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  return (
    <Suspense fallback={<p className="loading">Counting up the week...</p>}>
      <SummaryLoader searchParams={searchParams} />
    </Suspense>
  );
}
