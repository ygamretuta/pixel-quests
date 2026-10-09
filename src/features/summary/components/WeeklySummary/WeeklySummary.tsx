import { RestDays } from "@/features/summary/components/RestDays/RestDays";
import { BossRow } from "@/features/summary/components/BossRow/BossRow";
import { ShareButtons } from "@/features/summary/components/ShareButtons/ShareButtons";
import { StatTiles } from "@/features/summary/components/StatTiles/StatTiles";
import { WeekCellSwatch } from "@/features/summary/components/WeekCell/WeekCell";
import { WeekNav } from "@/features/summary/components/WeekNav/WeekNav";
import { WeekRow } from "@/features/summary/components/WeekRow/WeekRow";
import { formatDay } from "@/features/summary/lib/dates";
import type { WeekSummary } from "@/features/summary/types";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import "./WeeklySummary.css";

export function WeeklySummary({ summary }: { summary: WeekSummary }) {
  const { monday, days, dailies, weeklies, stats } = summary;

  return (
    <main className="weekly-summary">
      <WeekNav monday={monday} isCurrentWeek={summary.isCurrentWeek} />

      <h1 className="weekly-summary__title">
        {summary.isCurrentWeek ? "This week" : "Week of"}
        <span className="weekly-summary__range">
          {formatDay(days[0])} - {formatDay(days[6])}
        </span>
      </h1>

      <p className={cx("weekly-summary__insight", panelClass())}>{summary.insight}</p>

      <ShareButtons summary={summary} />

      <StatTiles
        tiles={[
          { label: "Quests done", value: stats.questsDone },
          { label: "Perfect days", value: stats.perfectDays },
          { label: "Coins earned", value: stats.coins },
          { label: "Photos", value: stats.photos },
        ]}
      />

      {summary.isCurrentWeek && (
        <p className="weekly-summary__streak">
          Current streak: {stats.streak} {stats.streak === 1 ? "day" : "days"}
        </p>
      )}

      <section className="weekly-summary__section">
        <h2 className="weekly-summary__subtitle">Daily quests</h2>
        {dailies.length === 0 && <p className="weekly-summary__empty">No daily quests this week.</p>}
        {dailies.map((daily) => (
          <WeekRow
            key={daily.id}
            title={daily.title}
            sprite={daily.sprite}
            doneDays={daily.doneDays}
            days={days}
            cells={daily.cells}
          />
        ))}
        <p className="weekly-summary__legend">
          <WeekCellSwatch state="done" /> done
          <WeekCellSwatch state="miss" /> missed
          <WeekCellSwatch state="rest" /> rest
          <WeekCellSwatch state="shield" /> shield
          <WeekCellSwatch state="off" /> no quest
          <WeekCellSwatch state="today" /> today
          <WeekCellSwatch state="na" /> not started
        </p>
      </section>

      <RestDays days={days} restDays={summary.restDays} />

      {weeklies.length > 0 && (
        <section className="weekly-summary__section">
          <h2 className="weekly-summary__subtitle">Weekly bosses</h2>
          {weeklies.map((weekly) => (
            <BossRow
              key={weekly.id}
              title={weekly.title}
              sprite={weekly.sprite}
              maxHp={weekly.maxHp}
              hits={weekly.hits}
              defeated={weekly.defeated}
            />
          ))}
        </section>
      )}
    </main>
  );
}
