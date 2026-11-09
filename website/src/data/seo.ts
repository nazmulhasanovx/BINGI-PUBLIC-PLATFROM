// Per-page <title> and description (English — site language). Used by the prerender script and on navigation.
export const seo: Record<string, { title: string; description: string }> = {
  '/': { title: 'BinGi — Hotel management technology for hotels and resorts', description: 'Website, bookings, front desk, housekeeping, restaurant, staff and accounts in one connected system. Your team runs the hotel; BinGi runs the technology.' },
  '/products': { title: 'Products — BinGi HMS Web, Mobile and Guest App', description: 'One ecosystem, three platforms: BinGi HMS Web for reception, HMS Mobile for staff and the Guest App with the BinGi Marketplace.' },
  '/pricing': { title: 'Pricing — from ৳30 per room a month | BinGi', description: 'Starter ৳30, Business ৳50, Ultra ৳116 per room a month, from 10 rooms. Save 10% on 6 months and 25% on 12. Every charge shown separately.' },
  '/help': { title: 'Help center — BinGi', description: 'Step-by-step guides, one-minute Bangla videos and direct support on WhatsApp for BinGi HMS.' },
  '/contact': { title: 'Book a demo — BinGi', description: 'Book a BinGi demo or write to us on WhatsApp. NEONECY, Level 11, Medona Tower, Mohakhali, Dhaka.' },
  '/legal/privacy': { title: 'Privacy policy — BinGi', description: 'How BinGi handles your data.' },
  '/legal/terms': { title: 'Terms of service — BinGi', description: 'Terms for using BinGi.' },
  '/legal/refund': { title: 'Refund policy — BinGi', description: 'BinGi refund policy.' },
  '/foundation': { title: 'Design foundation — BinGi', description: 'BinGi design tokens in the shadcn / 21st.dev theme format.' },
  '/help/create-booking': { title: 'How to create a new booking — BinGi help', description: 'Book a guest from the BinGi dashboard in a minute.' },
  '/help/add-room-type': { title: 'Add a room type and rooms — BinGi help', description: 'Set category, rate and room numbers in one go.' },
  '/help/change-plan': { title: 'View and change your plan — BinGi help', description: 'Monthly, 6 months or 12 months.' },
}
export const notFoundSeo = { title: 'Page not found — BinGi', description: 'This page does not exist.' }
