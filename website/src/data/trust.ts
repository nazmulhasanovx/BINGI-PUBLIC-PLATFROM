import type { L } from '../i18n/lang'
import { pick } from './content'

// Facts in the strip under the hero. Every fact names its source (admin will not publish one without it).
// `{liveModules}` is replaced by the number of modules marked live in the status registry.
export type TrustFact = { value: L; label: L; source: string }

export const trustFacts: TrustFact[] = pick('trustFacts', [
  { value: { bn: '{liveModules}', en: '{liveModules}' }, label: { bn: 'মডিউল প্রোডাকশনে চালু', en: 'modules live in production' }, source: 'Status registry (status.ts / admin)' },
  { value: { bn: 'বাংলা · EN', en: 'বাংলা · EN' }, label: { bn: 'পুরো সিস্টেম দুই ভাষায়', en: 'the whole system in two languages' }, source: 'Product fact' },
  { value: { bn: '7', en: '7' }, label: { bn: 'দিনের ফ্রি ট্রায়াল', en: 'day free trial' }, source: 'Current CTA: seven-day free trial' },
  { value: { bn: 'ঢাকা', en: 'Dhaka' }, label: { bn: 'থেকে টিম সাপোর্ট দেয়', en: 'based team that answers you' }, source: 'Company address' },
])
