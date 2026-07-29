import { ScrollFx } from "@/components/fx/ScrollFx";
import { SquareActor } from "@/components/fx/SquareActor";
import { LoaderOverlay } from "@/components/intro/LoaderOverlay";
import { Resume } from "@/components/resume/Sections";

export default function Home() {
  return (
    <>
      <LoaderOverlay />
      <Resume />
      <SquareActor />
      <ScrollFx />
    </>
  );
}
