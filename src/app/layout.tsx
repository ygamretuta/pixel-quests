import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import { SoundProvider } from "@/shared/audio/SoundProvider";
import "./globals.css";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixel Quests",
  description: "Defeat monsters by finishing real-life quests",
  appleWebApp: { capable: true, title: "Pixel Quests", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b1b3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={pixelFont.variable}>
      <body>
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
