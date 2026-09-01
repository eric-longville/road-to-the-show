import type { Metadata } from "next";
import { RoadView } from "@/components/road/RoadView";

export const metadata: Metadata = {
  title: "Road — Road to the Show",
  description: "Where every Cleveland draft pick sits on the road to MLB.",
};

export default function RoadPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-black tracking-tight">Road to the Show</h1>
        <p className="text-sm text-[color:var(--road-muted)]">
          Every Cleveland draft pick, placed on the road by the highest level
          they&rsquo;ve reached.
        </p>
      </header>
      <RoadView />
    </main>
  );
}
