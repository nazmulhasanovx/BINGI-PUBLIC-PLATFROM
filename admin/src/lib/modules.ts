import type { L } from './i18n'
import type { Role } from './auth'

// The admin's map: sidebar group → module → route → content types it edits.
// Plan: docs/05-admin/PLAN.md (M01–M22). Add a module here and it appears in the sidebar.
export type Module = { id: string; path: string; label: L; icon: string; roles: Role[]; types?: string[]; hint?: L }
export type Group = { id: string; label: L; modules: Module[] }

const C: Role[] = ['owner', 'editor']
export const groups: Group[] = [
  { id: 'daily', label: { bn: 'প্রতিদিন', en: 'Daily' }, modules: [
    { id: 'M02', path: '/', label: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' }, icon: 'LayoutGrid', roles: ['owner', 'editor', 'sales'] },
    { id: 'M03', path: '/leads', label: { bn: 'লিড', en: 'Leads' }, icon: 'Inbox', roles: ['owner', 'sales'] },
  ] },
  { id: 'growth', label: { bn: 'গ্রোথ', en: 'Growth' }, modules: [
    { id: 'M04', path: '/visitors', label: { bn: 'ভিজিটর', en: 'Visitors' }, icon: 'ChartLine', roles: ['owner', 'sales'] },
    { id: 'M05', path: '/seo', label: { bn: 'SEO', en: 'SEO' }, icon: 'Search', roles: C },
  ] },
  { id: 'content', label: { bn: 'কনটেন্ট', en: 'Content' }, modules: [
    { id: 'M06', path: '/content/pages', label: { bn: 'পেজ ও সেকশন', en: 'Pages & sections' }, icon: 'PanelsTopLeft', roles: C, types: ['page_copy', 'hidden_section', 'trust_fact', 'solution'] },
    { id: 'M07', path: '/content/navigation', label: { bn: 'মেনু ও ফুটার', en: 'Navigation & footer' }, icon: 'Menu', roles: ['owner'], types: ['nav_item', 'footer_column'] },
    { id: 'M08', path: '/content/settings', label: { bn: 'সাইট সেটিংস', en: 'Site settings' }, icon: 'Settings2', roles: ['owner'], types: ['site'] },
    { id: 'M09', path: '/content/status', label: { bn: 'স্ট্যাটাস', en: 'Status registry' }, icon: 'BadgeCheck', roles: ['owner'], types: ['module', 'platform_status', 'integration'],
      hint: { bn: 'কেউ যাচাই না করলে কোনো কিছু "Live" হবে না।', en: 'Nothing becomes "Live" without who verified it and when.' } },
    { id: 'M10', path: '/content/pricing', label: { bn: 'প্রাইসিং', en: 'Pricing' }, icon: 'BadgePercent', roles: ['owner'], types: ['pricing_config', 'plan', 'property_type', 'compare_group'],
      hint: { bn: 'সাময়িক: Super Admin-এর pricing API এলে এখানে শুধু দেখা যাবে (ADR 0001 · D3)।', en: 'Temporary: once Super Admin has a pricing API this becomes read-only (ADR 0001 · D3).' } },
    { id: 'M11', path: '/content/themes', label: { bn: 'থিম', en: 'Themes' }, icon: 'Palette', roles: C, types: ['theme', 'store_theme'] },
    { id: 'M12', path: '/content/team', label: { bn: 'টিম', en: 'Team' }, icon: 'Users', roles: C, types: ['team_member'] },
    { id: 'M13', path: '/content/testimonials', label: { bn: 'টেস্টিমোনিয়াল ও লোগো', en: 'Testimonials & logos' }, icon: 'Quote', roles: C, types: ['testimonial', 'client_logo'],
      hint: { bn: 'লিখিত অনুমতি upload না করলে দেখানো যাবে না।', en: 'Cannot be shown until the written permission is uploaded.' } },
    { id: 'M14', path: '/content/blog', label: { bn: 'ব্লগ', en: 'Blog' }, icon: 'Newspaper', roles: C, types: ['blog_post'] },
    { id: 'M15', path: '/content/help', label: { bn: 'হেল্প ও ডকস', en: 'Help & Docs' }, icon: 'LifeBuoy', roles: C, types: ['help_article', 'help_category', 'whats_new', 'doc_page'] },
    { id: 'M16', path: '/content/faq', label: { bn: 'FAQ', en: 'FAQ' }, icon: 'CircleHelp', roles: C, types: ['faq'] },
    { id: 'M17', path: '/content/changelog', label: { bn: 'চেঞ্জলগ', en: 'Changelog' }, icon: 'History', roles: C, types: ['changelog'] },
    { id: 'M18', path: '/content/careers', label: { bn: 'ক্যারিয়ার', en: 'Careers' }, icon: 'Briefcase', roles: C, types: ['career_team'] },
    { id: 'M19', path: '/media', label: { bn: 'মিডিয়া', en: 'Media library' }, icon: 'Images', roles: C },
  ] },
  { id: 'system', label: { bn: 'সিস্টেম', en: 'System' }, modules: [
    { id: 'M20', path: '/publish', label: { bn: 'পাবলিশ ও হিস্টরি', en: 'Publish & history' }, icon: 'Rocket', roles: C },
    { id: 'M21', path: '/users', label: { bn: 'ইউজার ও রোল', en: 'Users & roles' }, icon: 'UserCog', roles: ['owner'] },
    { id: 'M22', path: '/audit', label: { bn: 'অডিট লগ', en: 'Audit log' }, icon: 'ScrollText', roles: ['owner'] },
  ] },
]
export const allModules = groups.flatMap((g) => g.modules)
