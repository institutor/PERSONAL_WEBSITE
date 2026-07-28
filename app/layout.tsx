import type { Metadata } from "next";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
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
};

/**
 * Runs before first paint: motion preference gates CSS animation AND decides
 * whether the intro plays. data-intro='play' locks scroll (CSS) until the
 * cinematic hands off; 'skip' hides the loader entirely for reduced motion.
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
      className={`${inter.variable} ${grotesk.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <noscript>
          <style>{`[data-loader]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-void text-star">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
