// Property types shown in onboarding (backend codes, Bangla + English, icon).
import { BedDouble, Building, Building2, Car, Castle, Home, House, Sparkles, Tent, TreePalm } from "lucide-react";

export const TYPE_META: { slug: string; icon: typeof Building2; bn: string; en: string; subBn: string; subEn: string; main: boolean }[] = [
  { slug: "hotel", icon: Building2, bn: "হোটেল", en: "Hotel", subBn: "বিল্ডিং, তলা ও রুম", subEn: "Building, floors and rooms", main: true },
  { slug: "resort", icon: TreePalm, bn: "রিসোর্ট", en: "Resort", subBn: "রুম, কটেজ, ভিলা", subEn: "Rooms, cottages, villas", main: true },
  { slug: "guest-house", icon: House, bn: "গেস্ট হাউস", en: "Guest house", subBn: "অল্প কিছু রুম", subEn: "A few rooms", main: true },
  { slug: "homestay", icon: Home, bn: "হোম / ফ্ল্যাট", en: "Home / flat", subBn: "পুরো ফ্ল্যাট বা আলাদা রুম", subEn: "Whole flat or rooms", main: true },
  { slug: "serviced-apartment", icon: Building, bn: "সার্ভিসড অ্যাপার্টমেন্ট", en: "Serviced apartment", subBn: "টাওয়ার, তলা ও ফ্ল্যাট", subEn: "Tower, floors, flats", main: true },
  { slug: "motel", icon: Car, bn: "মোটেল", en: "Motel", subBn: "রাস্তার পাশে, পার্কিং", subEn: "Roadside, parking", main: false },
  { slug: "hostel", icon: BedDouble, bn: "হোস্টেল", en: "Hostel", subBn: "প্রাইভেট রুম ও পড", subEn: "Private rooms, pods", main: false },
  { slug: "vacation-rental", icon: Castle, bn: "ভ্যাকেশন রেন্টাল", en: "Vacation rental", subBn: "পুরো ভিলা বা বাড়ি", subEn: "Whole villa or home", main: false },
  { slug: "lodge", icon: Tent, bn: "লজ / রিট্রিট", en: "Lodge / retreat", subBn: "প্রকৃতির মাঝে কটেজ", subEn: "Nature cottages", main: false },
  { slug: "other", icon: Sparkles, bn: "অন্য কিছু", en: "Other", subBn: "একটু আলাদা", subEn: "Something different", main: false },
];
