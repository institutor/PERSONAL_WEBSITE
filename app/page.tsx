import { ScrollFx } from "@/components/fx/ScrollFx";
import { LoaderOverlay } from "@/components/intro/LoaderOverlay";
import { Resume } from "@/components/resume/Sections";

export default function Home() {
  return (
    <>
      <LoaderOverlay />
      <Resume />
      <ScrollFx />
    </>
  );
}
