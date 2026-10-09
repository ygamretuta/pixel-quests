import type { ReactNode } from "react";
import "./Loading.css";

export function Loading({ children }: { children: ReactNode }) {
  return <p className="loading">{children}</p>;
}
