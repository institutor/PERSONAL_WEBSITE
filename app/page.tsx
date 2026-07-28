import { ProgressInk } from "@/components/chrome/ProgressInk";
import { ScrollFx } from "@/components/fx/ScrollFx";
import { ThemeToggle } from "@/components/fx/ThemeToggle";
import { Resume } from "@/components/resume/Resume";
import { Sketch } from "@/components/resume/ornaments/Sketch";

export default function Home() {
  return (
    <>
      <ProgressInk />
      <ThemeToggle>
        <span className="icon-sun block w-7">
          <Sketch name="sun" />
        </span>
        <span className="icon-moon block w-7">
          <Sketch name="moon" />
        </span>
      </ThemeToggle>
      <Resume />
      <ScrollFx />
    </>
  );
}
