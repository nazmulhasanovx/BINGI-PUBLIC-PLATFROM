"use client";
// Communication data for any screen (Communication Center, Finance, Chat, Dashboard).
import { useMemo } from "react";
import { useBookings } from "@/lib/bookings/store";
import { useGuestNames } from "@/lib/guests/store";
import { useComm, type Ref } from "@/lib/communication/store";
import { useProperty } from "../property";

export function useCommData() {
  const h = useProperty();
  const bk = useBookings(h);
  const gmap = useGuestNames(h);
  const refs: Ref[] = useMemo(() => bk.list.map((b) => { const g = gmap.get(b.guestId); return { code: b.code, guest: g?.name ?? "Guest", phone: g?.phone ?? "", email: g?.email ?? "", created: b.created, from: b.from, status: b.status }; }), [bk.list, gmap]);
  const comm = useComm(h, refs);
  return { h, bk, gmap, refs, comm };
}
