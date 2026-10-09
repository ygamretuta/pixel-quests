import { Suspense } from "react";
import { Treats } from "@/features/rewards/components/Treats/Treats";
import { getTreats } from "@/features/rewards/server/rewards";
import { Loading } from "@/shared/ui/Loading/Loading";

export const metadata = { title: "Treats · Pixel Quests" };

async function TreatsLoader() {
  return <Treats {...(await getTreats())} />;
}

export default function TreatsPage() {
  return (
    <Suspense fallback={<Loading>Opening the treat box...</Loading>}>
      <TreatsLoader />
    </Suspense>
  );
}
