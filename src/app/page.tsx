import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Road to the Show
        </h1>
        <p className="mt-3 text-lg text-[color:var(--road-muted)]">
          Track MLB draft classes visually — from draft day, through the minors,
          all the way to the majors.
        </p>
      </div>
      <Link
        href="/road"
        className="rounded-lg bg-[color:var(--road-ink)] px-5 py-3 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        Explore the road →
      </Link>
    </main>
  );
}
