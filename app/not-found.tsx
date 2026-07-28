import Link from "next/link";
import { Sawtooth } from "@/components/fx/Sawtooth";

export default function NotFound() {
  return (
    <main className="band-ink flex min-h-svh flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="paren">( 404 )</p>
      <h1 className="display text-[clamp(4rem,14vw,12rem)]">
        LOST<span className="mx-[0.06em] inline-block h-[0.6em] w-[0.6em] bg-volt align-baseline" />
      </h1>
      <div className="w-full max-w-md">
        <Sawtooth color="volt" height={14} />
      </div>
      <Link href="/" className="pill">
        Back home ↗
      </Link>
    </main>
  );
}
