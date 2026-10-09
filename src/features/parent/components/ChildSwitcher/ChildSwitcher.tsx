"use client";

import { useTransition } from "react";
import { selectChild } from "@/features/parent/actions";
import { cx } from "@/shared/lib/css/cx";
import "./ChildSwitcher.css";

type ChildSwitcherProps = { kids: { id: number; name: string }[]; currentId: number };

/** Parent mode: choose which child you are looking at (and which child this device plays as). */
export function ChildSwitcher({ kids, currentId }: ChildSwitcherProps) {
  const [pending, startTransition] = useTransition();
  if (kids.length < 2) return null;

  return (
    <div className="child-switcher" role="group" aria-label="Choose child">
      {kids.map((child) => (
        <button
          key={child.id}
          type="button"
          className={cx("child-switcher__button", child.id === currentId && "child-switcher__button--current")}
          aria-pressed={child.id === currentId}
          disabled={pending}
          onClick={() => startTransition(() => selectChild(child.id))}
        >
          {child.name}
        </button>
      ))}
    </div>
  );
}
