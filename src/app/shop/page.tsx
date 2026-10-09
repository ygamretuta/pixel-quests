import { Suspense } from "react";
import { AwakeGate } from "@/features/bedtime/server/AwakeGate";
import { isParent } from "@/features/parent/server/auth";
import { ShieldBoost } from "@/features/quests/components/ShieldBoost/ShieldBoost";
import { getShieldCount } from "@/features/quests/server/streak";
import { Shop } from "@/features/wardrobe/components/Shop/Shop";
import { getWardrobe } from "@/features/wardrobe/server/wardrobe";
import { getChildId } from "@/shared/server/child";
import { Loading } from "@/shared/ui/Loading/Loading";

export const metadata = { title: "Merchant · Pixel Quests" };

async function ShopLoader() {
  const parent = await isParent();
  const childId = await getChildId();
  const [wardrobe, shields] = await Promise.all([getWardrobe(childId), getShieldCount(childId)]);

  return (
    <Shop
      {...wardrobe}
      isParent={parent}
      boosts={<ShieldBoost shields={shields} coins={wardrobe.coins} isParent={parent} />}
    />
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<Loading>Opening the shop...</Loading>}>
      <AwakeGate>
        <ShopLoader />
      </AwakeGate>
    </Suspense>
  );
}
