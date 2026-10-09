import type { ReactNode } from "react";
import { BadgeGrid } from "@/features/trophies/components/BadgeGrid/BadgeGrid";
import { LevelCard } from "@/features/trophies/components/LevelCard/LevelCard";
import { MonsterDex } from "@/features/trophies/components/MonsterDex/MonsterDex";
import type { TrophyData } from "@/features/trophies/server/trophies";
import { PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import "./TrophyRoom.css";

type TrophyRoomProps = {
  name: string;
  /** Her dressed-up character, drawn by the page (the wardrobe owns that art). */
  hero: ReactNode;
  /** Her pet, if she has one. */
  pet?: ReactNode;
  data: TrophyData;
};

/** Her profile: level, badges, and the monster collection. */
export function TrophyRoom({ name, hero, pet, data }: TrophyRoomProps) {
  return (
    <main className="trophy-room">
      <header className="trophy-room__header">
        <PixelLinkButton href="/" variant="secondary">
          Quests
        </PixelLinkButton>
        <PixelLinkButton href="/shop" variant="secondary">
          Shop
        </PixelLinkButton>
      </header>

      <section className="trophy-room__hero">
        <div className="trophy-room__portrait">
          <div className="trophy-room__hero-art">{hero}</div>
          {pet && <div className="trophy-room__pet">{pet}</div>}
        </div>
        <div className="trophy-room__intro">
          <h1 className="trophy-room__name">{name}</h1>
          <p className="trophy-room__total">{data.defeats} monsters defeated</p>
        </div>
      </section>

      <LevelCard level={data.level} />
      <BadgeGrid badges={data.badges} />
      <MonsterDex dex={data.dex} />
    </main>
  );
}
