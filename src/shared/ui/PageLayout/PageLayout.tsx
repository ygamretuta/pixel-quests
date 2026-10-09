import type { ReactNode } from "react";
import { PixelLinkButton } from "@/shared/ui/PixelButton/PixelButton";
import "./PageLayout.css";

type PageLayoutProps = { title: string; children: ReactNode };

/** A simple parent page: a Back button, a title, and sections stacked below. */
export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <main className="page-layout">
      <header className="page-layout__header">
        <PixelLinkButton href="/" variant="secondary">
          Back
        </PixelLinkButton>
      </header>
      <h1 className="page-layout__title">{title}</h1>
      {children}
    </main>
  );
}
