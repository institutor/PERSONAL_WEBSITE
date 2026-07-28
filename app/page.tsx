import { Resume } from "@/components/resume/Resume";
import { ThemeToggle } from "@/components/fx/ThemeToggle";

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <Resume />
    </>
  );
}
