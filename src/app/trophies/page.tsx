import { Suspense } from "react";
import { AwakeGate } from "@/features/bedtime/server/AwakeGate";
import { TrophyRoom } from "@/features/trophies/components/TrophyRoom/TrophyRoom";
import { getTrophies } from "@/features/trophies/server/trophies";
import { characterLayers } from "@/features/wardrobe/data/character";
import { equippedPet } from "@/features/wardrobe/data/pets";
import { getEquipped } from "@/features/wardrobe/server/wardrobe";
import { getChild } from "@/shared/server/child";
import { Loading } from "@/shared/ui/Loading/Loading";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";

export const metadata = { title: "Trophies · Pixel Quests" };

async function TrophyLoader() {
  const child = await getChild();
  const [data, equipped] = await Promise.all([getTrophies(child.id), getEquipped(child.id)]);
  const pet = equippedPet(equipped);

  return (
    <TrophyRoom
      name={child.name}
      data={data}
      hero={<PixelSprite sprite={characterLayers(equipped)} label="Your hero" />}
      pet={pet ? <PixelSprite sprite={pet} label="Your pet" /> : undefined}
    />
  );
}

export default function TrophiesPage() {
  return (
    <Suspense fallback={<Loading>Polishing the trophies...</Loading>}>
      <AwakeGate>
        <TrophyLoader />
      </AwakeGate>
    </Suspense>
  );
}
