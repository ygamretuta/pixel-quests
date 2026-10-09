import type { ReactNode } from "react";
import { ICONS_BY_KEY } from "@/features/rewards/data/icons";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import "./RewardCard.css";

type RewardCardProps = {
  title: string;
  /** A key from REWARD_ICONS; omit for a text-only card. */
  icon?: string;
  detail?: string;
  tone?: "waiting" | "done";
  /** Buttons shown under the title. */
  children?: ReactNode;
};

/** One reward, request or answer. Shared by her treats page and the parent's reward manager. */
export function RewardCard({ title, icon, detail, tone, children }: RewardCardProps) {
  return (
    <li
      className={cx(
        "reward-card",
        icon && "reward-card--with-icon",
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
      {children && <div className="reward-card__actions">{children}</div>}
    </li>
  );
}
