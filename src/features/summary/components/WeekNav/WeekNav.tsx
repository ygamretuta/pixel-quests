import { PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import { shiftDay } from "@/shared/lib/time/pht";
import "./WeekNav.css";

type WeekNavProps = { monday: string; isCurrentWeek: boolean };

/** Back to the board, plus arrows to move between weeks. */
export function WeekNav({ monday, isCurrentWeek }: WeekNavProps) {
  return (
    <header className="week-nav">
      <PixelLinkButton href="/" variant="secondary">
        Back
      </PixelLinkButton>
      <nav className="week-nav__arrows" aria-label="Choose week">
        <PixelLinkButton
          href={`/summary?week=${shiftDay(monday, -7)}`}
          variant="secondary"
          className="week-nav__arrow-button"
          aria-label="Previous week"
        >
          <span className="week-nav__arrow week-nav__arrow--left" />
        </PixelLinkButton>
        {isCurrentWeek ? (
          <span className="pixel-button pixel-button--secondary week-nav__arrow-button week-nav__arrow-button--off" aria-hidden="true">
            <span className="week-nav__arrow week-nav__arrow--right" />
          </span>
        ) : (
          <PixelLinkButton
            href={`/summary?week=${shiftDay(monday, 7)}`}
            variant="secondary"
            className="week-nav__arrow-button"
            aria-label="Next week"
          >
            <span className="week-nav__arrow week-nav__arrow--right" />
          </PixelLinkButton>
        )}
      </nav>
    </header>
  );
}
