import { AwardsPrograms } from "./AwardsPrograms";
import { Experience } from "./Experience";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Journey } from "./Journey";
import { Leadership } from "./Leadership";
import { Skills } from "./Skills";
import { Teaching } from "./Teaching";

/**
 * The whole resume page — all Server Components (static HTML, SEO/print/no-JS
 * friendly). #resume-root is the visibility gate the intro controls (Phase 4).
 */
export function Resume() {
  return (
    <main id="resume-root" className="relative">
      <Hero />
      <Journey />
      <Experience />
      <Leadership />
      <AwardsPrograms />
      <Skills />
      <Teaching />
      <Footer />
    </main>
  );
}
