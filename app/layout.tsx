import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const shantell = localFont({
  src: "../public/fonts/ShantellSans-VF.woff2",
  variable: "--font-shantell",
  weight: "300 800",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jiewen Huang — by Jiewen",
  description:
    "Jiewen Huang — CS & Math @ Columbia '30. Builds things that ship: NaomiAI ELA, agent-native backends, and hand-drawn websites like this one.",
};

/**
 * Runs before first paint: resolves theme (stored preference, else system)
 * and whether motion is allowed (drives draw-on gating in CSS).
 * Phase 4 extends this with the intro play/skip decision.
 */
const noFlashScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t}catch(e){d.dataset.theme='dark'}try{d.dataset.motion=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on'}catch(e){d.dataset.motion='on'}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${caveat.variable} ${shantell.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
