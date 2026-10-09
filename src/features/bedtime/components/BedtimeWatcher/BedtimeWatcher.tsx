"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNow } from "@/shared/lib/time/useNow";

/** Reloads the page when bedtime or wake-up time passes while the app is open. */
export function BedtimeWatcher({ at }: { at: number | null }) {
  const router = useRouter();
  const now = useNow();

  useEffect(() => {
    if (at !== null && now && now >= at) router.refresh();
  }, [at, now, router]);

  return null;
}
