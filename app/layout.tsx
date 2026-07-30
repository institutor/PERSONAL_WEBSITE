import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { BottomBar } from "@/components/chrome/BottomBar";
import { TopBar } from "@/components/chrome/TopBar";
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

/**
 * No OpenGraph / Twitter card metadata by choice: link posts stay a plain
 * link instead of an embed card. Title + description remain for search.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://jiewenhuang.com"),
  alternates: { canonical: "/" },
  title: "Jiewen Huang · I'm Jiewen",
  description: "Jiewen Huang · CS & Math @ Columbia '30.",
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
      </body>
    </html>
  );
}
