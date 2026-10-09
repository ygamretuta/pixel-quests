import { coin } from "@/shared/lib/pixel/icons";
import { PixelSprite } from "@/shared/ui/PixelSprite/PixelSprite";
import { cx } from "@/shared/lib/css/cx";
import "./CoinBalance.css";

type CoinBalanceProps = { amount: number; className?: string };

export function CoinBalance({ amount, className }: CoinBalanceProps) {
  return (
    <div className={cx("coin-balance", className)} aria-label={`${amount} coins`}>
      <span className="coin-balance__icon">
        <PixelSprite sprite={coin} label="" />
      </span>
      <span className="coin-balance__amount">{amount}</span>
    </div>
  );
}
