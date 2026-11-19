"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useParams } from "next/navigation";

export default function HotelNotFound() {
  const { slug } = useParams<{ slug: string }>();
  const base = `/hotel/${slug}`;
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-soft text-action"><Compass className="size-8" /></span>
      <h1 className="mt-5 text-[28px] font-bold">This page isn’t here</h1>
      <p className="mt-2 text-muted">It may have moved, or the hotel switched it off. Try the home page or see our rooms.</p>
      <div className="mt-6 flex justify-center gap-2.5">
        <Link href={base} className="inline-flex h-12 items-center rounded-full bg-action px-6 font-semibold text-on-action">Home</Link>
        <Link href={`${base}/rooms`} className="inline-flex h-12 items-center rounded-full border border-line bg-surface px-6 font-semibold">See rooms</Link>
      </div>
    </div>
  );
}
