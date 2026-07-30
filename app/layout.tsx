import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { BottomBar } from "@/components/chrome/BottomBar";
import { TopBar } from "@/components/chrome/TopBar";
import { CursorFx } from "@/components/fx/CursorFx";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jiewen Huang — I'm Jiewen",
  description:
    "Jiewen Huang — CS & Math @ Columbia '30. Builds things that ship: NaomiAI ELA, agent-native backends, and this site.",
  openGraph: {
    title: "I'm Jiewen",
    description: "CS & Math @ Columbia '30 · builds things that ship.",
    images: ["/og.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "I'm Jiewen",
    description: "CS & Math @ Columbia '30 · builds things that ship.",
    images: ["/og.jpg"],
  },
};

/**
 * Runs before first paint: motion preference gates CSS animation AND decides
 * whether the intro plays (data-intro locks scroll until the handoff).
 */
const noFlashScript = `(function(){var d=document.documentElement;var rm=false;try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}d.dataset.motion=rm?'off':'on';d.dataset.intro=rm?'skip':'play'})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <noscript>
          <style>{`[data-loader]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-ink text-bone">
        <SmoothScroll>
          <TopBar />
          {children}
          <BottomBar />
        </SmoothScroll>
        <CursorFx />
      </body>
    </html>
  );
}
