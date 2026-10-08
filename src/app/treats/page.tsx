import { Suspense } from "react";
import { Treats } from "@/features/rewards/Treats";
import { getTreats } from "@/server/rewards";

export const metadata = { title: "Treats · Pixel Quests" };

async function TreatsLoader() {
  return <Treats {...(await getTreats())} />;
}

export default function TreatsPage() {
  return (
    <Suspense fallback={<p className="loading">Opening the treat box...</p>}>
      <TreatsLoader />
    </Suspense>
  );
}
