import type { ReactNode } from "react";
import { ICONS_BY_KEY } from "@/features/rewards/data/icons";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { SpeakButton } from "@/shared/ui/SpeakButton/SpeakButton";
import "./RewardCard.css";

type RewardCardProps = {
  title: string;
  /** A key from REWARD_ICONS; omit for a text-only card. */
  icon?: string;
  detail?: string;
  tone?: "waiting" | "done";
  /** If set, a speaker button reads this aloud. */
  speech?: string;
  /** Buttons shown under the title. */
  children?: ReactNode;
};

/** One reward, request or answer. Shared by her treats page and the parent's reward manager. */
export function RewardCard({ title, icon, detail, tone, speech, children }: RewardCardProps) {
  return (
    <li
      className={cx(
        "reward-card",
        icon && "reward-card--with-icon",
        speech && "reward-card--speaks",
        tone && `reward-card--${tone}`,
        panelClass(tone === "waiting" ? "highlight" : "plain"),
      )}
    >
      {icon && (
        <span className="reward-card__icon">
          <PixelSprite sprite={ICONS_BY_KEY[icon] ?? ICONS_BY_KEY.gift} label="" />
        </span>
      )}
      <span className="reward-card__name">
        {title}
        {detail && <span className="reward-card__detail">{detail}</span>}
      </span>
      {speech && (
        <span className="reward-card__speak">
          <SpeakButton text={speech} />
        </span>
      )}
      {children && <div className="reward-card__actions">{children}</div>}
    </li>
  );
}
