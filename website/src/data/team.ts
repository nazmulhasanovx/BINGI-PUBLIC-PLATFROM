// People shown in "The team behind BinGi" (home page, after FAQ).
// Add a photo: put a square-ish image (min 800×1000, face centred) in /public/team/ and set `photo`.
// Keep roles exactly as the person's real title — no invented bios.
import type { L } from '../i18n/lang'

export type Member = { name: string; role: L; group: L; photo?: string }

export const team: Member[] = [
  { name: 'Nazmul Hasan', role: { bn: 'প্রতিষ্ঠাতা, NEONECY ও BinGi · সিস্টেম ইঞ্জিনিয়ার', en: 'Founder, NEONECY & BinGi · System Engineer' }, group: { bn: 'প্রতিষ্ঠাতা', en: 'Founder' }, photo: '/team/nazmul-hasan.webp' },
  { name: 'Md. Yeapas', role: { bn: 'সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার', en: 'Senior Software Engineer' }, group: { bn: 'ইঞ্জিনিয়ারিং', en: 'Engineering' } },
  { name: 'Md. Abdul Hamim', role: { bn: 'ফ্লাটার ডেভেলপার', en: 'Flutter Developer' }, group: { bn: 'মোবাইল', en: 'Mobile' } },
  { name: 'Most. Shahina Akter', role: { bn: 'ডিজিটাল মার্কেটিং এক্সিকিউটিভ', en: 'Digital Marketing Executive' }, group: { bn: 'মার্কেটিং', en: 'Marketing' } },
]
