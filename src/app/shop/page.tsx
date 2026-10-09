import { Suspense } from "react";
import { AwakeGate } from "@/features/bedtime/server/AwakeGate";
import { isParent } from "@/features/parent/server/auth";
import { Shop } from "@/features/wardrobe/components/Shop/Shop";
import { getWardrobe } from "@/features/wardrobe/server/wardrobe";
import { Loading } from "@/shared/ui/Loading/Loading";

export const metadata = { title: "Merchant · Pixel Quests" };

async function ShopLoader() {
  const parent = await isParent();
  return <Shop {...(await getWardrobe())} isParent={parent} />;
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
