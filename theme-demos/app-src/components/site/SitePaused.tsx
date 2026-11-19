import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Hotel } from "@/lib/types";
import { Logo } from "./Logo";

/** Shown when the hotel pauses its website in HMS (Website Management → Online controls). */
export function SitePaused({ hotel }: { hotel: Hotel }) {
  const tel = `tel:${hotel.phone.replace(/[^+\d]/g, "")}`;
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center"><Logo text={hotel.logoText} href={`/hotel/${hotel.slug}`} /></div>
        <h1 className="mt-8 text-[28px] font-bold leading-tight">Online booking is paused for now</h1>
        <p className="mt-3 text-muted">{hotel.name} is still welcoming guests. Contact the hotel directly to book or ask a question.</p>
        <div className="mt-8 grid gap-2.5">
          <a href={tel} className="flex h-12 items-center justify-center gap-2 rounded-full bg-action font-semibold text-on-action"><Phone className="size-[18px]" /> Call {hotel.phone}</a>
          {hotel.whatsapp && <a href={`https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}`} className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface font-semibold"><MessageCircle className="size-[18px]" /> WhatsApp</a>}
          <a href={`mailto:${hotel.email}`} className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface font-semibold"><Mail className="size-[18px]" /> {hotel.email}</a>
        </div>
        <p className="mt-10 text-[13px] text-muted">{hotel.address}</p>
      </div>
    </main>
  );
}
