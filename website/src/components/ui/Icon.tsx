import { BarChart3, BedDouble, Bot, Boxes, CalendarDays, Code2, CreditCard, Globe, MessagesSquare, Network, Rocket, Send, Sparkles, Users, UtensilsCrossed, Wallet, type LucideIcon } from 'lucide-react'

const map: Record<string, LucideIcon> = { BarChart3, BedDouble, Bot, Boxes, CalendarDays, Code2, CreditCard, Globe, MessagesSquare, Network, Rocket, Send, Sparkles, Users, UtensilsCrossed, Wallet }

export function Icon({ name, className = 'size-5' }: { name: string; className?: string }) {
  const C = map[name] ?? Sparkles
  return <C className={className} aria-hidden="true" strokeWidth={1.75} />
}
