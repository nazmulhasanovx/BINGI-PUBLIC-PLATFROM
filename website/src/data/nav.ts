import type { L } from '../i18n/lang'
import { pick } from './content'

// Header menu and footer columns. Admin: Content → Navigation & footer.
export type NavItem = { to: string; label: L; phoneOnly?: boolean }
export type FooterLink = { to: string; label: L; kind?: 'link' | 'whatsapp' | 'demo'; badge?: L }
export type FooterColumn = { title: L; links: FooterLink[] }

export const nav: NavItem[] = pick('nav', [
  { to: '/products', label: { bn: 'প্রোডাক্ট', en: 'Products' } },
  { to: '/solutions', label: { bn: 'সলিউশন', en: 'Solutions' } },
  { to: '/themes', label: { bn: 'থিম', en: 'Themes' } },
  { to: '/ai', label: { bn: 'BinGi AI', en: 'BinGi AI' } },
  { to: '/pricing', label: { bn: 'প্রাইসিং', en: 'Pricing' } },
  { to: '/docs', label: { bn: 'ডকস', en: 'Docs' } },
  { to: '/help', label: { bn: 'হেল্প', en: 'Help' } },
  { to: '/contact', label: { bn: 'যোগাযোগ', en: 'Contact' }, phoneOnly: true },
])

export const footer: FooterColumn[] = pick('footer', [
  { title: { bn: 'প্রোডাক্ট', en: 'Product' }, links: [
    { to: '/products', label: { bn: 'প্ল্যাটফর্ম ও মডিউল', en: 'Platforms & modules' } },
    { to: '/solutions', label: { bn: 'সলিউশন', en: 'Solutions' } },
    { to: '/themes', label: { bn: 'ওয়েবসাইট থিম', en: 'Website themes' } },
    { to: '/ai', label: { bn: 'BinGi AI', en: 'BinGi AI' }, badge: { bn: 'Beta', en: 'Beta' } },
    { to: '/pricing', label: { bn: 'প্রাইসিং', en: 'Pricing' } },
    { to: '/marketplace', label: { bn: 'মার্কেটপ্লেস', en: 'Marketplace' } },
    { to: '/partners', label: { bn: 'পার্টনার', en: 'Partners' } },
  ] },
  { title: { bn: 'রিসোর্স', en: 'Resources' }, links: [
    { to: '/docs', label: { bn: 'ডকুমেন্টেশন', en: 'Documentation' } },
    { to: '/help', label: { bn: 'হেল্প সেন্টার', en: 'Help center' } },
    { to: '/blog', label: { bn: 'গাইড', en: 'Guides' } },
    { to: '/changelog', label: { bn: 'নতুন কী', en: 'What’s new' } },
    { to: '/customers', label: { bn: 'গ্রাহকের গল্প', en: 'Customer stories' } },
    { to: '', kind: 'whatsapp', label: { bn: 'WhatsApp', en: 'WhatsApp' } },
    { to: '', kind: 'demo', label: { bn: 'ডেমো বুক করুন', en: 'Book a demo' } },
  ] },
  { title: { bn: 'কোম্পানি', en: 'Company' }, links: [
    { to: '/contact', label: { bn: 'আমাদের সম্পর্কে', en: 'About us' } },
    { to: '/careers', label: { bn: 'ক্যারিয়ার', en: 'Careers' } },
    { to: '/legal/privacy', label: { bn: 'প্রাইভেসি', en: 'Privacy' } },
    { to: '/legal/terms', label: { bn: 'শর্তাবলি', en: 'Terms' } },
    { to: '/foundation', label: { bn: 'ডিজাইন ফাউন্ডেশন', en: 'Design foundation' } },
  ] },
])
