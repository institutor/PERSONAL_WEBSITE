import { Resume } from "@/components/resume/Resume";
import { Sketch } from "@/components/resume/ornaments/Sketch";
import { ThemeToggle } from "@/components/fx/ThemeToggle";

export default function Home() {
  return (
    <>
      <ThemeToggle>
        <span className="icon-sun block w-7">
          <Sketch name="sun" />
        </span>
        <span className="icon-moon block w-7">
          <Sketch name="moon" />
        </span>
      </ThemeToggle>
      <Resume />
    </>
  );
}
