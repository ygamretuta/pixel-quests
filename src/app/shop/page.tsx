import { Suspense } from "react";
import { Shop } from "@/features/wardrobe/Shop";
import { getWardrobe } from "@/server/wardrobe";

export const metadata = { title: "Merchant · Pixel Quests" };

async function ShopLoader() {
  return <Shop {...(await getWardrobe())} />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="loading">Opening the shop...</p>}>
      <ShopLoader />
    </Suspense>
  );
}
