// Website Management — everything an owner needs to run the hotel website, grouped like iOS Settings.
// Each page maps to something the themes actually show (see technology/website-management.md).
import {
  BedDouble, CalendarRange, Eye, Globe2, Image as ImageIcon, Inbox, Info, Languages, LayoutTemplate, ListTree, Palette, Power, Search, Sparkles, Star, Tag, Link2,
} from "lucide-react";

export type WmPage = { id: string; label: string; group: string; icon: typeof Globe2 };

export const WM_PAGES: WmPage[] = [
  { id: "overview", label: "Overview", group: "", icon: Globe2 },
  { id: "design", label: "Theme & Style", group: "Design", icon: Palette },
  { id: "homepage", label: "Homepage", group: "Design", icon: LayoutTemplate },
  { id: "pages", label: "Pages & Menu", group: "Design", icon: ListTree },
  { id: "photos", label: "Photos", group: "Design", icon: ImageIcon },
  { id: "rooms", label: "Rooms", group: "Content", icon: BedDouble },
  { id: "services", label: "Services & Dining", group: "Content", icon: Sparkles },
  { id: "offers", label: "Offers", group: "Content", icon: Tag },
  { id: "reviews", label: "Reviews", group: "Content", icon: Star },
  { id: "info", label: "Contact & Policies", group: "Content", icon: Info },
  { id: "booking", label: "Booking Engine", group: "Bookings", icon: CalendarRange },
  { id: "inquiries", label: "Inquiries", group: "Bookings", icon: Inbox },
  { id: "seo", label: "Google & Sharing", group: "Settings", icon: Search },
  { id: "domain", label: "Domain", group: "Settings", icon: Link2 },
  { id: "languages", label: "Languages", group: "Settings", icon: Languages },
  { id: "online", label: "Online On/Off", group: "Settings", icon: Power },
  { id: "publish", label: "Publish", group: "Publish", icon: Eye },
];
