import { Suspense } from "react";
import { ParentOnly } from "@/features/parent/components/ParentOnly/ParentOnly";
import { isParent } from "@/features/parent/server/auth";
import { RewardsAdmin } from "@/features/rewards/components/RewardsAdmin/RewardsAdmin";
import { getRewardsAdmin } from "@/features/rewards/server/rewards";
import { Loading } from "@/shared/ui/Loading/Loading";

export const metadata = { title: "Rewards · Pixel Quests" };

async function RewardsLoader() {
  if (!(await isParent())) return <ParentOnly />;
  return <RewardsAdmin {...(await getRewardsAdmin())} />;
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<Loading>Loading...</Loading>}>
      <RewardsLoader />
    </Suspense>
  );
}
