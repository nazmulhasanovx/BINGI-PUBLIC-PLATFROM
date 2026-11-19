import { BadgeCheck, BookOpenText, BadgePercent, Briefcase, ChartLine, CircleHelp, History, Images, Inbox, LayoutGrid, LifeBuoy, Menu, Newspaper, Palette, PanelsTopLeft, Quote, Rocket, ScrollText, Search, Settings2, UserCog, Users, type LucideIcon } from 'lucide-react'

// Sidebar icons by name (lib/modules.ts). Add the import here when you add a module.
const icons: Record<string, LucideIcon> = { BadgeCheck, BookOpenText, BadgePercent, Briefcase, ChartLine, CircleHelp, History, Images, Inbox, LayoutGrid, LifeBuoy, Menu, Newspaper, Palette, PanelsTopLeft, Quote, Rocket, ScrollText, Search, Settings2, UserCog, Users }
export function Icon({ name, className }: { name: string; className?: string }) {
  const I = icons[name] ?? LayoutGrid
  return <I className={className} aria-hidden="true" />
}
