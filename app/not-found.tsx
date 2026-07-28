import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="microlabel">404 — Signal lost</p>
      <h1
        className="knockout font-display text-7xl font-bold tracking-tight sm:text-9xl"
        style={{ "--kx": "70%", "--ky": "35%" } as React.CSSProperties}
      >
        Lost in the void
      </h1>
      <Link href="/" className="btn-void text-star">
        ← BACK TO EARTH
      </Link>
    </main>
  );
}
