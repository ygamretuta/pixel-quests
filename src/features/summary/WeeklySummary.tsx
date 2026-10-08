import Link from "next/link";
import { spritesByKey } from "@/features/quests/monsters";
import { slime } from "@/features/quests/sprites";
import { PixelSprite } from "@/shared/pixel/PixelSprite";
import { shiftDay } from "@/shared/time/pht";
import type { WeekSummary } from "@/server/summary";
import "./summary.css";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function dayLabel(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-PH", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

const CELL_LABEL = {
  done: "done",
  miss: "missed",
  na: "not started",
  future: "upcoming",
  today: "in progress",
} as const;

export function WeeklySummary({ summary }: { summary: WeekSummary }) {
  const { monday, days, dailies, weeklies, stats } = summary;
  const tiles = [
    { label: "Quests done", value: stats.questsDone },
    { label: "Perfect days", value: stats.perfectDays },
    { label: "Coins earned", value: stats.coins },
    { label: "Photos", value: stats.photos },
  ];

  return (
    <main className="summary">
      <header className="summary__header">
        <Link href="/" className="pixel-button pixel-button--secondary summary__back">
          Back
        </Link>
        <nav className="summary__nav" aria-label="Choose week">
          <Link
            href={`/summary?week=${shiftDay(monday, -7)}`}
            className="pixel-button pixel-button--secondary"
            aria-label="Previous week"
          >
            <span className="summary__arrow summary__arrow--left" />
          </Link>
          {summary.isCurrentWeek ? (
            <span className="pixel-button pixel-button--secondary summary__disabled" aria-hidden="true">
              <span className="summary__arrow summary__arrow--right" />
            </span>
          ) : (
            <Link
              href={`/summary?week=${shiftDay(monday, 7)}`}
              className="pixel-button pixel-button--secondary"
              aria-label="Next week"
            >
              <span className="summary__arrow summary__arrow--right" />
            </Link>
          )}
        </nav>
      </header>

      <h1 className="summary__title">
        {summary.isCurrentWeek ? "This week" : "Week of"}
        <span className="summary__range">
          {dayLabel(days[0])} - {dayLabel(days[6])}
        </span>
      </h1>

      <p className="summary__insight">{summary.insight}</p>

      <ul className="summary__tiles">
        {tiles.map((tile) => (
          <li key={tile.label} className="summary__tile">
            <span className="summary__value">{tile.value}</span>
            <span className="summary__label">{tile.label}</span>
          </li>
        ))}
      </ul>

      {summary.isCurrentWeek && (
        <p className="summary__streak">Current streak: {stats.streak} {stats.streak === 1 ? "day" : "days"}</p>
      )}

      <section className="summary__section">
        <h2 className="summary__subtitle">Daily quests</h2>
        {dailies.length === 0 && <p className="summary__empty">No daily quests this week.</p>}
        {dailies.map((daily) => (
          <div key={daily.id} className="summary__daily">
            <div className="summary__daily-head">
              <span className="summary__thumb">
                <PixelSprite sprite={spritesByKey[daily.sprite] ?? slime} label="" />
              </span>
              <span className="summary__quest">{daily.title}</span>
              <span className="summary__count">{daily.doneDays}/7</span>
            </div>
            <ol className="summary__cells">
              {daily.cells.map((cell, index) => (
                <li
                  key={days[index]}
                  className={`summary__cell summary__cell--${cell}`}
                  aria-label={`${dayLabel(days[index])}: ${CELL_LABEL[cell]}`}
                >
                  {WEEKDAYS[index]}
                </li>
              ))}
            </ol>
          </div>
        ))}
        <p className="summary__legend">
          <span className="summary__cell summary__cell--done">&nbsp;</span> done
          <span className="summary__cell summary__cell--miss">&nbsp;</span> missed
          <span className="summary__cell summary__cell--today">&nbsp;</span> today
          <span className="summary__cell summary__cell--na">&nbsp;</span> not started
        </p>
      </section>

      {weeklies.length > 0 && (
        <section className="summary__section">
          <h2 className="summary__subtitle">Weekly bosses</h2>
          {weeklies.map((weekly) => (
            <div key={weekly.id} className="summary__daily">
              <div className="summary__daily-head">
                <span className="summary__thumb">
                  <PixelSprite sprite={spritesByKey[weekly.sprite] ?? slime} label="" />
                </span>
                <span className="summary__quest">{weekly.title}</span>
                <span className="summary__count">{weekly.defeated ? "Defeated" : `${weekly.hits}/${weekly.maxHp}`}</span>
              </div>
              <div className="hp-bar" aria-hidden="true">
                {Array.from({ length: weekly.maxHp }, (_, i) => (
                  <span
                    key={i}
                    className={"hp-bar__segment" + (i < weekly.maxHp - weekly.hits ? " hp-bar__segment--full" : "")}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
