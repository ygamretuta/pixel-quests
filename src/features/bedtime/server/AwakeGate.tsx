import "server-only";
import type { ReactNode } from "react";
import { BedtimeScreen } from "@/features/bedtime/components/BedtimeScreen/BedtimeScreen";
import { BedtimeWatcher } from "@/features/bedtime/components/BedtimeWatcher/BedtimeWatcher";
import { getBedtime } from "@/features/bedtime/server/bedtime";
import { isParent } from "@/features/parent/server/auth";

/**
 * Wraps kid pages. While the app sleeps she sees the bedtime screen instead of the page
 * (children are not even rendered, so no data is fetched). A signed-in parent always gets through.
 */
export async function AwakeGate({ children }: { children: ReactNode }) {
  const { settings, asleep, nextChange } = await getBedtime();
  if (asleep && !(await isParent())) {
    return <BedtimeScreen wake={settings.wake} wakeAt={nextChange} />;
  }
  return (
    <>
      {children}
      <BedtimeWatcher at={nextChange} />
    </>
  );
}
