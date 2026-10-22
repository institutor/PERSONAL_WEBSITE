import { LensFx } from "@/components/fx/LensFx";
import { LetterFlow } from "@/components/fx/LetterFlow";
import { ScrollFx } from "@/components/fx/ScrollFx";
import { SquareActor } from "@/components/fx/SquareActor";
import { LoaderOverlay } from "@/components/intro/LoaderOverlay";
import { Resume } from "@/components/resume/Sections";

export default function Home() {
  return (
    <>
      <LoaderOverlay />
      <Resume />
      {/* LensFx first: it places the lens slot before the actor measures its route */}
      <LensFx />
      <SquareActor />
      {/* after the actor: reads its frame's final position */}
      <LetterFlow />
      <ScrollFx />
    </>
  );
}
