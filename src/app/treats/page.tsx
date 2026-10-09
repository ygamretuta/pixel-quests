import { Suspense } from "react";
import { AwakeGate } from "@/features/bedtime/server/AwakeGate";
import { Treats } from "@/features/rewards/components/Treats/Treats";
import { getTreats } from "@/features/rewards/server/rewards";
import { getChildId } from "@/shared/server/child";
import { Loading } from "@/shared/ui/Loading/Loading";

export const metadata = { title: "Treats · Pixel Quests" };

async function TreatsLoader() {
  return <Treats {...(await getTreats(await getChildId()))} />;
}

export default function TreatsPage() {
  return (
    <Suspense fallback={<Loading>Opening the treat box...</Loading>}>
      <AwakeGate>
        <TreatsLoader />
      </AwakeGate>
    </Suspense>
  );
}
