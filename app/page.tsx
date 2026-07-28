import { ProgressInk } from "@/components/chrome/ProgressInk";
import { LoaderOverlay } from "@/components/intro/LoaderOverlay";
import { Resume } from "@/components/resume/Resume";

export default function Home() {
  return (
    <>
      <LoaderOverlay />
      <ProgressInk />
      <Resume />
    </>
  );
}
