import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import "./BackupSettings.css";

export function BackupSettings() {
  return (
    <section className={cx("backup-settings", panelClass())}>
      <h2 className="backup-settings__title">Backup</h2>
      <p className="backup-settings__hint">
        A copy of all quests, coins, outfits and history (no photos) is saved every Sunday and the last 8 are kept.
        You can also download one now.
      </p>
      <a className="pixel-button backup-settings__download" href="/api/backup" download>
        Download backup
      </a>
    </section>
  );
}
