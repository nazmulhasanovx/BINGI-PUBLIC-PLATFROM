import type { L } from '../i18n/lang'
import { pick } from './content'

// FAQ per page. Admin: Content → FAQ (drag to reorder).
export type Faq = { page: 'home' | 'pricing' | 'marketplace'; q: L; a: L }

export const faqs: Faq[] = pick('faqs', [
  { page: 'home', q: { bn: 'কিছু ইনস্টল করতে হবে?', en: 'Do I need to install anything?' }, a: { bn: 'না। BinGi HMS ব্রাউজারে চলে। স্টাফদের জন্য মোবাইল অ্যাপও আছে।', en: 'No. BinGi HMS runs in the browser, and staff also have a mobile app.' } },
  { page: 'home', q: { bn: 'বাংলায় ব্যবহার করা যাবে?', en: 'Can my team use it in Bangla?' }, a: { bn: 'হ্যাঁ, বাংলা আর ইংরেজি দুটোই আছে।', en: 'Yes, it works in Bangla and English.' } },
  { page: 'home', q: { bn: 'গেস্ট কীভাবে বুক করবে?', en: 'How do guests book?' }, a: { bn: 'আপনার নিজের ওয়েবসাইট, BinGi মার্কেটপ্লেস (bingi.app) অথবা সরাসরি রিসেপশনে।', en: 'On your own website, the BinGi Marketplace (bingi.app), or at reception.' } },
  { page: 'home', q: { bn: 'আমার ডেটা কি আলাদা থাকবে?', en: 'Is my data kept separate?' }, a: { bn: 'হ্যাঁ। প্রতিটা প্রপার্টির ডেটা, স্টাফ আর বিল আলাদা, শুধু অনুমতি পাওয়া মানুষ দেখে।', en: 'Yes. Each property has its own data, staff and invoices, visible only to people you allow.' } },
  { page: 'home', q: { bn: 'সেটআপে সাহায্য পাবো?', en: 'Will you help me set up?' }, a: { bn: 'হ্যাঁ। রিমোট ট্রেনিং এখন ফ্রি; চাইলে অনসাইট ট্রেনিংও আছে।', en: 'Yes. Remote training is free right now, and onsite training is available.' } },
  { page: 'pricing', q: { bn: 'দাম কীভাবে হিসাব হয়?', en: 'How is the price calculated?' }, a: { bn: 'রুম সংখ্যা × প্রতি রুমের মাসিক রেট × মাস। উদাহরণ: 10 রুম, Business, মাসিক = 10 × ৳70 = ৳700। 6 মাসে প্রায় 10% আর 12 মাসে প্রায় 25% ছাড়।', en: 'Rooms × monthly rate per room × months. Example: 10 rooms on Business, monthly = 10 × ৳70 = ৳700. About 10% off for 6 months and 25% for 12 months.' } },
  { page: 'pricing', q: { bn: 'আমার রুম খুব কম, নিতে পারব?', en: 'I have very few rooms. Can I join?' }, a: { bn: 'হ্যাঁ। 1টা রুম থাকলেও শুরু করা যায়। আপনি শুধু আপনার আসল রুমগুলোর টাকা দেবেন।', en: 'Yes. You can start with just 1 room and pay only for the rooms you have.' } },
  // Website booking fee is still the old per-plan value until Nazmul decides ([W] in the 25 Nov brief).
  { page: 'pricing', q: { bn: 'বুকিংয়ে কত কাটে?', en: 'What do you take per booking?' }, a: { bn: 'BinGi Marketplace থেকে আসা বুকিংয়ে সব plan-এ 7%। আপনার ওয়েবসাইটের বুকিংয়ে plan অনুযায়ী ছোট একটা ফি — প্রতিটা plan কার্ডের ফি ক্যালকুলেটরে দেখুন। রিসেপশনে নেওয়া বুকিংয়ে কিছুই না।', en: '7% on bookings from BinGi Marketplace, on every plan. A small per-plan fee on bookings from your own website — see the fee calculator on each plan card. Nothing on bookings you take at reception.' } },
  { page: 'pricing', q: { bn: 'আর কোনো খরচ আছে?', en: 'Any other costs?' }, a: { bn: 'Business আর Ultra-তে একবারের activation fee (এখন ৳4,999 আর ৳8,999)। অনলাইনে গেস্ট টাকা দিলে gateway fee 2.5% আলাদা (অনলাইন পেমেন্ট Coming Soon)। SMS ও ইমেইল আপনার নিজের প্রোভাইডারের চার্জে যায়। এখন কোনো VAT যোগ হয় না।', en: 'A one-time activation fee on Business and Ultra (now ৳4,999 and ৳8,999). A separate 2.5% gateway fee when guests pay online (online payment coming soon). SMS and email go through your own provider. No VAT is added for now.' } },
  { page: 'pricing', q: { bn: 'ফ্রি ট্রায়াল আছে?', en: 'Is there a free trial?' }, a: { bn: 'হ্যাঁ, 7 দিন। অ্যাকাউন্ট খুলুন, প্রপার্টি সেটআপ করুন, আজই শুরু করুন।', en: 'Yes, 7 days. Create your account, set up your property and start today.' } },
  { page: 'marketplace', q: { bn: 'মার্কেটপ্লেসে আসতে কী লাগে?', en: 'What do I need to get listed?' }, a: { bn: 'BinGi অ্যাকাউন্ট, রুম আর দাম সেটআপ, আর আসল ছবি। তারপর HMS থেকে অনুরোধ পাঠালে BinGi টিম যাচাই করে অনুমোদন দেয়।', en: 'A BinGi account, your rooms and prices set up, and real photos. Then request access in HMS and the BinGi team reviews and approves.' } },
  { page: 'marketplace', q: { bn: 'কমিশন কখন কাটা হয়?', en: 'When does the commission apply?' }, a: { bn: 'শুধু মার্কেটপ্লেস থেকে আসা বুকিংয়ে — সব plan-এ 7%। বিস্তারিত দাম পেজে আছে।', en: 'Only on bookings that come from the marketplace — 7% on every plan. Details are on the pricing page.' } },
  { page: 'marketplace', q: { bn: 'গেস্ট কি অনলাইনে টাকা দিতে পারে?', en: 'Can guests pay online?' }, a: { bn: 'BinGi দিয়ে অনলাইন পেমেন্ট এখনো Coming Soon। আপনার প্রপার্টিতে কোন পেমেন্ট উপায় চালু, BinGi টিমকে জিজ্ঞেস করুন।', en: 'Online payment through BinGi is still Coming Soon. Ask the BinGi team which payment options are active for your property.' } },
  { page: 'marketplace', q: { bn: 'গেস্টের মেসেজ কে দেখে?', en: 'Who answers guest messages?' }, a: { bn: 'আপনার টিম — HMS-এর Chat থেকে। মেসেজ সরাসরি সেখানে আসে।', en: 'Your team, from Chat in HMS. Messages arrive there directly.' } },
  { page: 'marketplace', q: { bn: 'কিছু রুম মার্কেটপ্লেস থেকে সরাতে পারব?', en: 'Can I keep some rooms off the marketplace?' }, a: { bn: 'হ্যাঁ। HMS-এ প্রতিটা রুম মার্কেটপ্লেসে দেখাবে কিনা, আলাদা করে ঠিক করা যায়।', en: 'Yes. In HMS you choose, room by room, whether it shows on the marketplace.' } },
])

export const faqsFor = (page: Faq['page']) => faqs.filter((f) => f.page === page)
