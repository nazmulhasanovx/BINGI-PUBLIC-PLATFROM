import { notFound } from "next/navigation";
import { AcceptedPayments, CancelPolicy } from "@/components/site/SiteRules";
import type { Metadata } from "next";
import { getHotel } from "@/lib/data";
import { PageHero } from "@/components/site/PageHero";
import { SectionTabs } from "@/components/explore/SectionTabs";
import { DraftText } from "@/components/site-draft/Draft";

export const metadata: Metadata = { title: "Policies" };

export default async function PoliciesPage(props: PageProps<"/hotel/[slug]/policies">) {
  const { slug } = await props.params;
  const hotel = await getHotel(slug);
  if (!hotel) notFound();
  const sections = [
    { id: "booking", title: "Booking & cancellation", body: [<CancelPolicy key="c" hotel={hotel} />, "Bookings made on this website are confirmed by the hotel by SMS. Your booking reference starts with WBK."] },
    { id: "stay", title: "Check-in & house rules", body: [`Check-in from ${hotel.checkIn}. Check-out by ${hotel.checkOut}.`, "A government ID (NID or passport) is required for every adult guest at check-in.", <DraftText key="p" slug={hotel.slug} k="policy.pets" fallback={hotel.policies.pets} />] },
    { id: "children", title: "Children & extra beds", body: [<DraftText key="ch" slug={hotel.slug} k="policy.children" fallback={hotel.policies.children} />] },
    { id: "payments", title: "Payments & tax", body: [<AcceptedPayments key="ap" hotel={hotel} />, hotel.policies.tax, "Service charge is added to the room rate first; VAT is then charged on the rate plus service charge, as required in Bangladesh."] },
    { id: "privacy", title: "Privacy", body: [`${hotel.name} uses your details only to manage your stay. Booking data is stored on BinGi Hotel Management Technology, the hotel’s booking system. To ask about or delete your data, contact the hotel at ${hotel.email}.`] },
  ];
  return (
    <>
      <PageHero slug={hotel.slug} pageId="policies" title="Policies" />
      <SectionTabs items={sections.map((s) => ({ id: s.id, label: s.title.split(" & ")[0] }))} />
      <div className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 md:py-14">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-32 border-b border-line py-8 first:pt-0 last:border-0">
            <h2 className="text-xl font-bold md:text-2xl">{s.title}</h2>
            {s.body.map((b, i) => (
              <p key={i} className="mt-3 text-[16px] leading-relaxed text-ink/80">{b}</p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
