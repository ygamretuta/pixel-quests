import { Suspense } from "react";
import { Shop } from "@/features/wardrobe/Shop";
import { isParent } from "@/server/auth";
import { getWardrobe } from "@/server/wardrobe";

export const metadata = { title: "Merchant · Pixel Quests" };

async function ShopLoader() {
  const parent = await isParent();
  return <Shop {...(await getWardrobe())} isParent={parent} />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="loading">Opening the shop...</p>}>
      <ShopLoader />
    </Suspense>
  );
}
