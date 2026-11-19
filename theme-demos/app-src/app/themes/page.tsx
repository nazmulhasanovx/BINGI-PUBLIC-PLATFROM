import Link from "next/link";
import Image from "next/image";
import { MASTERS, PAID_MASTERS } from "@/themes/registry";
import { MANIFESTS } from "@/themes/manifest";

export default function Index() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <Image src="/brand/bingi-master.svg" alt="BinGi" width={120} height={40} className="h-10 w-auto" priority />
      <p className="mt-6 text-sm font-semibold text-action">Web Themes · {MASTERS.length} included + {PAID_MASTERS.length} paid</p>
      <h1 className="mt-2 text-3xl font-bold">Theme preview</h1>
      <ul className="mt-8 space-y-3">
        <li>
          <Link className="block rounded-2xl border-2 border-brand bg-surface p-4 font-semibold shadow-card" href="/hms/website/overview">
            /hms/website <span className="font-normal text-muted">— HMS · Website Management (manage any property, any theme)</span>
          </Link>
        </li>
        <li>
          <Link className="block rounded-2xl border-2 border-brand bg-surface p-4 font-semibold shadow-card" href="/onboarding">
            /onboarding <span className="font-normal text-muted">— Owner onboarding (6 parts → HMS setup mode)</span>
          </Link>
        </li>
        {[...MASTERS, ...PAID_MASTERS].map((m) => (
          <li key={m.id}>
            <Link className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 shadow-card hover:border-brand-ring" href={`/hotel/${m.demo}`}>
              <Image src={`/themes/${m.id}.jpg`} alt="" width={96} height={60} className="h-[60px] w-24 shrink-0 rounded-lg object-cover object-top" />
              <span className="min-w-0">
                <span className="block font-semibold">{m.name} <span className="font-normal text-muted">· {m.plan}</span></span>
                <span className="block truncate text-sm text-muted">{MANIFESTS[m.id].tagline} — /hotel/{m.demo}</span>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link className="block rounded-2xl border border-line bg-surface p-4 font-semibold shadow-card hover:border-brand-ring" href="/theme-lab">
            /theme-lab <span className="font-normal text-muted">— 10 colour themes + contrast check</span>
          </Link>
        </li>
      </ul>
    </main>
  );
}
