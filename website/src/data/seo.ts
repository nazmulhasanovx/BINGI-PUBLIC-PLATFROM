// Per-page <title> and description (English — site language). Used by the prerender script and on navigation.
export const seo: Record<string, { title: string; description: string }> = {
  '/': { title: 'BinGi — Hotel management technology for hotels and resorts', description: 'Website, bookings, front desk, housekeeping, restaurant, staff and accounts in one connected system. Your team runs the hotel; BinGi runs the technology.' },
  '/products': { title: 'Products — BinGi HMS Web, Mobile and Guest App', description: 'One ecosystem, three platforms: BinGi HMS Web for reception, HMS Mobile for staff and the Guest App with the BinGi Marketplace.' },
  '/pricing': { title: 'Pricing — from ৳25 per room a month | BinGi', description: 'Starter ৳25, Business ৳70, Ultra ৳116 per room a month, from 10 rooms. Save on 6 and 12 months. VAT extra. Every charge shown separately.' },
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
Object.assign(seo, {
  '/solutions': { title: 'Solutions by property — hotels, resorts, guest houses | BinGi', description: 'BinGi for hotels, resorts, guest houses, homes and hotel groups — the plan, modules and website themes that fit each.' },
  '/solutions/hotel': { title: 'Hotel management software for hotels | BinGi', description: 'Reception to housekeeping, restaurant to accounts — BinGi Business for hotels in Bangladesh.' },
  '/solutions/resort': { title: 'Resort management software | BinGi', description: 'Staff, stock, restaurant and services in one system — BinGi Ultra for resorts.' },
  '/solutions/guest-house': { title: 'Guest house booking software | BinGi', description: 'Bookings, guest records and your own website — BinGi Starter for guest houses.' },
  '/solutions/home-stay': { title: 'Booking software for homes and flats | BinGi', description: 'List a few rooms online and take bookings — set up in minutes with BinGi Starter.' },
  '/solutions/hotel-group': { title: 'Software for hotel groups | BinGi', description: 'Several properties under one account, set up around your needs — BinGi Custom.' },
  '/themes': { title: 'Hotel website themes — NEST, CITY, ESCAPE, GRAND and more | BinGi', description: 'Your hotel’s own website with a booking engine. 8 themes for guest houses, cottages, hostels, city hotels, villas, apartments and resorts.' },
  '/blog': { title: 'Guides for hotels — BinGi', description: 'Short, practical guides on bookings, housekeeping and direct bookings.' },
  '/blog/one-calendar-no-double-bookings': { title: 'One calendar for every booking: stop double bookings — BinGi', description: 'Phone, walk-in, website and marketplace — keep every booking in one place and mistakes drop.' },
  '/blog/housekeeping-routine-small-hotels': { title: 'A simple housekeeping routine for small hotels — BinGi', description: 'From check-out to room ready — a four-step routine any team can follow.' },
  '/blog/more-direct-bookings': { title: '6 simple ways to get more direct bookings — BinGi', description: 'Bookings from your own website cost less in commission — start with these six things.' },
  '/customers': { title: 'Customer stories — BinGi', description: 'Hotels that run on BinGi, in their own words — coming soon.' },
  '/changelog': { title: 'What’s new — BinGi', description: 'What shipped in BinGi, what’s in testing and what’s next.' },
  '/partners': { title: 'Marketplace & partners — BinGi', description: 'List your property on the BinGi Marketplace. OTA and payment integrations coming soon.' },
  '/careers': { title: 'Careers at NEONECY — BinGi', description: 'Join the team building BinGi hotel software in Dhaka.' },
})
export const notFoundSeo = { title: 'Page not found — BinGi', description: 'This page does not exist.' }
