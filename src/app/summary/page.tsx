import { Suspense } from "react";
import { ParentOnly } from "@/features/parent/components/ParentOnly/ParentOnly";
import { isParent } from "@/features/parent/server/auth";
import { WeeklySummary } from "@/features/summary/components/WeeklySummary/WeeklySummary";
import { getWeekSummary } from "@/features/summary/server/summary";
import { getChildId } from "@/shared/server/child";
import { Loading } from "@/shared/ui/Loading/Loading";

export const metadata = { title: "Weekly summary · Pixel Quests" };

type SearchParams = Promise<{ week?: string }>;

async function SummaryLoader({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isParent())) return <ParentOnly />;
  const { week } = await searchParams;
  const valid = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : null;
  return <WeeklySummary summary={await getWeekSummary(await getChildId(), valid)} />;
}

export default function SummaryPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<Loading>Counting up the week...</Loading>}>
      <SummaryLoader searchParams={searchParams} />
    </Suspense>
  );
}
