// BinGi public documentation — ONE source for the /docs pages, per-page Markdown, /llms.txt and /llms-full.txt.
// Written so a person OR any LLM can read it and fix a user's issue.
// Sources: Sidebar v6 (names follow the live HMS), module rules, pricing data, status registry, staging check 9 Nov 2026,
// live HMS view-only check 11 Nov 2026 (Payments, Operations, Finance, Reports, Communication Center, Chat),
// the HMS redesign prototype (sections marked "Next version (in testing, not live)") and the BinGi AI plan repo.
// DRAFT v0.1 — the support team must verify each "Fix" against the live HMS before we call it final.
// English only (best for LLMs); the AI can answer the user in Bangla.

export type Fix = { symptom: string; causes: string[]; steps: string[] }
export type DocSection = { heading: string; text?: string; list?: string[]; steps?: string[]; table?: { head: string[]; rows: string[][] } }
export type DocPage = {
  slug: string
  group: 'Start here' | 'Platform' | 'Modules' | 'Account' | 'Help'
  title: string
  summary: string
  where?: string // where it lives in the HMS sidebar
  plan?: string // which plans include it (from the pricing catalogue)
  status?: 'Live' | 'Beta' | 'Coming soon' | 'Rolling out'
  sections: DocSection[]
  fixes?: Fix[]
}

export const DOCS_VERSION = 'v0.2 draft · 12 November 2026'
export const SUPPORT = 'WhatsApp +880 1624-127562 (https://wa.me/8801624127562) · BinGi, Level 11, Medona Tower, 28 Mohakhali C/A, Dhaka 1213'
const ACCESS_CHECK = 'Check the three gates every BinGi screen respects: (1) your PLAN includes the module, (2) your ROLE has permission, (3) the right PROPERTY is selected in the property switcher at the top.'

export const docs: DocPage[] = [
  // ───────────────────────── START HERE
  {
    slug: 'fix-with-ai', group: 'Start here', title: 'Fix an issue with AI',
    summary: 'Give this documentation to any AI assistant (ChatGPT, Claude, Gemini…) together with your problem, and it can walk you through the fix.',
    sections: [
      { heading: 'Three steps', steps: [
        'Copy the full documentation: use “Copy all docs for AI” on this page, or open /llms-full.txt and copy everything.',
        'Paste it into the AI chat, then paste the issue template below, filled in.',
        'Follow the AI’s steps. If it says the issue is not covered, contact BinGi support.',
      ] },
      { heading: 'Issue template (fill in and paste)', list: [
        'My role: (owner / manager / receptionist / housekeeping / waiter / accountant / other)',
        'My plan: (Starter / Business / Ultra / Custom / trial / don’t know)',
        'Where: (Web HMS / HMS Mobile / Guest App / hotel website / BinGi Marketplace) — page name in the sidebar',
        'What I did: (step by step)',
        'What I expected:',
        'What happened instead: (exact error text if any)',
        'Since when / does it happen every time:',
      ] },
      { heading: 'Tips for a good answer', list: [
        'Write the exact button and page names you see.',
        'Copy any error message word for word.',
        'Never paste passwords, OTP codes, card numbers or guests’ ID numbers into an AI chat.',
        'You can ask the AI to answer in Bangla.',
      ] },
    ],
  },
  {
    slug: 'overview', group: 'Start here', title: 'What BinGi is',
    summary: 'BinGi Hotel Management Technology is one connected system for a property’s website, bookings, front desk, housekeeping, restaurant, staff, money and reports. The hotel team runs the hotel; BinGi runs the hotel’s technology.',
    sections: [
      { heading: 'Who makes it', text: 'BinGi is built by NEONECY, Dhaka, Bangladesh (since 2023).' },
      { heading: 'Who it is for', list: ['Homes and flats', 'Guest houses', 'Hotels', 'Resorts', 'Hotel groups (several properties)'] },
      { heading: 'One booking, one ID', text: 'Every booking keeps one booking ID from start to finish, whichever channel it came from.', steps: [
        'Booking arrives — BinGi Marketplace, your website or walk-in at reception.',
        'A room is assigned.',
        'The guest checks in.',
        'Services (restaurant, other services) are added to the guest’s bill (folio).',
        'Payment is collected; the guest checks out.',
        'A cleaning task is created for the room.',
        'Accounts and reports update; the stay is saved in guest history.',
      ] },
      { heading: 'Four statuses that are always separate', text: 'BinGi never mixes these. A booking can be “checked out” while the room is still “needs cleaning”.', table: { head: ['Status', 'Answers the question', 'Examples'], rows: [
        ['Booking status', 'Where is the reservation?', 'Pending · Confirmed · Checked in · Checked out · Cancelled'],
        ['Payment status', 'Has the guest paid?', 'Unpaid · Partly paid · Paid · Refunded'],
        ['Room readiness', 'Can the room be given?', 'Ready · Needs cleaning · Occupied'],
        ['Maintenance status', 'Is something broken?', 'OK · Blocked for repair'],
      ] } },
      { heading: 'Three gates on every screen', text: ACCESS_CHECK },
    ],
  },
  {
    slug: 'getting-started', group: 'Start here', title: 'Getting started',
    summary: 'Create an account, set up your property and rooms, then go live.',
    sections: [
      { heading: 'Create your account', steps: [
        'Go to hms.bingi.app/register.',
        'Sign up with your phone number or email and confirm the one-time code (OTP).',
        'Choose your property type and set up your property: name, place, rooms and prices.',
        'Set check-in / check-out times and the payment methods you accept.',
      ] },
      { heading: 'Go-live checklist', text: 'These must be done before guests can book you online:', list: [
        'Rooms approved by BinGi (shows “Awaiting BinGi approval” until then).',
        'At least one real photo per listing.',
        'A sensible price on every room.',
        'At least one payment method.',
        'Website published (Website Management › Publishing).',
      ] },
      { heading: 'Log in later', text: 'hms.bingi.app/login — phone or email with your password, or a one-time code.' },
    ],
    fixes: [
      { symptom: 'I did not receive the OTP code', causes: ['Wrong phone number or email', 'SMS delayed by the operator', 'Code expired'], steps: ['Check the number/email you typed.', 'Wait one minute, then tap “Resend”.', 'Check spam for email codes.', 'Still nothing: contact support with the number you used (not the code).'] },
      { symptom: 'I forgot my password', causes: ['—'], steps: ['On the login page tap “Forgot password”.', 'Confirm the one-time code.', 'Set a new password.'] },
    ],
  },
  // ───────────────────────── PLATFORM
  {
    slug: 'ecosystem', group: 'Platform', title: 'The BinGi ecosystem',
    summary: 'Several apps share the same data. Change something once and it changes everywhere.',
    sections: [
      { heading: 'Platforms', table: { head: ['Platform', 'For', 'Where', 'Status'], rows: [
        ['BinGi HMS Web', 'Owners, managers, reception', 'hms.bingi.app', 'Live'],
        ['HMS Mobile', 'Staff on the move (role-wise tabs)', 'Phone app', 'Status to confirm'],
        ['Guest App + BinGi Marketplace', 'Guests: find, book, chat', 'bingi.app', 'Marketplace web live; app status to confirm'],
        ['Hotel website (themes)', 'Your own website with booking engine', 'Your domain', 'Live; new theme collection rolling out'],
        ['Super Admin', 'BinGi team (approvals, plans, payouts, support)', 'Internal', 'Internal'],
        ['BinGi AI', 'An assistant that answers questions and drafts work', 'Local app on your computer (beta)', 'Beta — by invitation'],
      ] } },
      { heading: 'Properties and roles', list: [
        'One login can manage one or more properties; switch with the property switcher at the top.',
        'Each user has a role (for example owner, manager, receptionist, housekeeping, waiter, accountant). The role decides which pages and buttons they see.',
        'Staff join with an invite and their own BinGi ID; one person keeps one BinGi account.',
      ] },
      { heading: 'Coming soon (not live)', list: ['Channel manager / OTA connections (Booking.com, Agoda and others)', 'BinGi Payments (online payments through BinGi)', 'Developer API', 'BinGi AI inside the HMS (a local beta exists — see the BinGi AI page)', 'Theme Store: 21 premium themes (Luxury and Signature collections), ৳50/month each, free for now'] },
      { heading: 'Being redesigned (in testing, not live)', list: ['Dashboard with a priorities list that reads every module (to collect, rooms to clean, QR orders, unread chat, approvals, refunds, failed messages)', 'Bookings front office: room board, group and walk-in booking, waitlist, online pre-check-in, day close', 'Payments as one ledger with “To collect” and “Refunds due” lists', 'Operations renamed “Expenses”, with approval above a limit and supplier bills from Inventory', 'Reports workspace with one date range for 12 reports', 'Communication Center: 15 automatic messages, delivery policy, credits, history', 'Chat with website enquiries, quick replies and a booking card', 'Settings: one place for each setting', 'Room / Accommodation page (live Rooms layout, out-of-order per room)', 'Discounts & Rates with a rates calendar', 'Guests and Reviews together, guest status from bookings', 'Staff: an Easy view for small teams', 'Inventory: stores, purchase orders, stock count, recipes', 'Other Services: a Today board with assignment', 'Owner onboarding in 6 parts'] },
    ],
  },
  {
    slug: 'how-it-works', group: 'Platform', title: 'How the modules connect',
    summary: 'Every fact is recorded once, in the module that owns it, and every other screen reads it from there. That is why a number can be checked anywhere.',
    sections: [
      { heading: 'The money path', steps: [
        'A guest pays on a booking, a restaurant bill or a service order.',
        'The payment is recorded once, in that module, and shows in Payments.',
        'Cash goes into the Cashbox drawer that is open at that moment. Card, bKash and bank are recorded only.',
        'Money paid online through BinGi (website advance, marketplace) shows in Finance, where BinGi’s fees come off and you request a payout.',
        'Reports read all of these. Reports never store their own copy.',
      ] },
      { heading: 'Restaurant and service charges on a room', text: 'An order “posted to the room” is not a payment. It is added to the guest’s room bill and is paid at check-out, so it is counted once — as the booking payment.' },
      { heading: 'Four statuses that are always separate', table: { head: ['Status', 'Answers', 'Examples'], rows: [
        ['Booking status', 'Where is the stay?', 'Confirmed · Checked in · Checked out · Cancelled · No-show'],
        ['Payment status', 'Has the guest paid?', 'Paid · Partly paid · Due · Refund due'],
        ['Room readiness', 'Can the next guest use the room?', 'Needs cleaning · Cleaning · Inspect · Ready'],
        ['Maintenance', 'Can the room be sold at all?', 'In order · Out of order (with dates and reason)'],
      ] } },
      { heading: 'Three gates on every screen', text: 'Plan (does your plan include it?), Role (may this user see or change it?) and Property (is the right property selected?).' },
      { heading: 'One home for each setting', text: 'A setting is changed in one place only. Other screens show a short summary and a link to that place.' },
    ],
  },
  {
    slug: 'bingi-ai', group: 'Platform', title: 'BinGi AI', status: 'Beta',
    summary: 'An assistant that answers questions about your hotel and drafts routine work for you to approve. Beta, by invitation: it runs on your own computer from the BinGi AI repo and connects to BinGi with your hotel’s API access. It is not inside the HMS yet.',
    sections: [
      { heading: 'What it does', table: { head: ['Kind', 'Example', 'Who starts it'], rows: [
        ['Ask', '“How many check-outs today?” · “Which stock item cost most this month?”', 'Staff'],
        ['Do (with approval)', '“Create a housekeeping task for room 104” · “Draft a reply to this guest”', 'Staff — a person approves before anything changes'],
        ['Watch', 'Low-stock alert · end-of-day summary', 'Rules the owner turns on'],
      ] } },
      { heading: 'Rules it follows', list: [
        'It never has more access than the person using it: plan, role, property and permission are checked for every action.',
        'It does not move money (no refunds, payouts or payment capture) and does not delete anything.',
        'It shows a draft first; nothing changes in BinGi until a person approves.',
        'Numbers in its answers come from BinGi data, not guesses.',
        'Guest messages are treated as information, never as instructions.',
        'Bangla, English and Banglish.',
      ] },
      { heading: 'Set up the beta', list: ['Ask the BinGi team on WhatsApp for beta access (GitHub repo access + your BinGi API access).', 'Install Node.js (LTS), Git and Ollama; run `ollama pull qwen3:4b`.', 'Clone the repo: `git clone -b develop https://github.com/nazmulhasanovx/BINGI-AI-.git bingi-ai`.', 'Double-click “Start BinGi AI.command” (Mac) or “Start BinGi AI (Windows).bat”; it opens http://localhost:8787.', 'User menu › Connectivity › BinGi HMS API: enter the address and access token, then Test. Optional: an OpenRouter key for a cloud model.'] },
      { heading: 'Where it will appear later', list: ['“Ask BinGi” panel in the Web HMS', '“AI reply” in Chat', '“Daily brief” on the Dashboard', 'HMS Mobile'] },
      { heading: 'Status', text: 'Beta, by invitation, running locally. Until a hotel is connected it shows a sample hotel. Not inside the HMS yet.' },
    ],
  },
  {
    slug: 'navigation', group: 'Platform', title: 'Finding your way in the HMS',
    summary: 'The sidebar is grouped by how often you use each page.',
    sections: [
      { heading: 'Sidebar groups', table: { head: ['Group', 'Pages'], rows: [
        ['Daily operations', 'Dashboard · Bookings · Rooms · Housekeeping · Guests · Chat · Meals'],
        ['Property & team', 'Staff · Inventory · Other Services'],
        ['Money & pricing', 'Discounts & Rates · Payments · Cashbox · Finance · Operations (expenses) · Billing & Subscription'],
        ['Reports & online', 'Reports · Communication Center · Website Management'],
        ['Bottom', 'Settings'],
      ] } },
      { heading: 'Good to know', list: [
        'Pages your plan does not include are hidden or locked.',
        'Sidebar mode: Flat or Expandable — Settings › Personal Preferences › Appearance.',
        'Language: English or Bangla (interface language in your preferences).',
        'Search the whole HMS from the search box in the header.',
      ] },
    ],
    fixes: [
      { symptom: 'A page or module is missing from my sidebar', causes: ['Your plan does not include it', 'Your role has no permission', 'A different property is selected'], steps: [ACCESS_CHECK, 'Owners: see your plan in Finance › Billing & Subscription.', 'Ask the owner/admin to give your role access (Settings › Users & Roles).'] },
    ],
  },
  // ───────────────────────── MODULES
  {
    slug: 'dashboard', group: 'Modules', title: 'Dashboard', where: 'Daily operations › Dashboard', plan: 'All plans', status: 'Live',
    summary: 'Today at a glance: arrivals, departures, occupancy, revenue and things that need attention.',
    sections: [
      { heading: 'What you see', list: ['Greeting and key numbers for today', 'Arriving today / departing today', 'Rooms to prepare (links to Housekeeping)', 'Website & booking status', '“New Booking” button'] },
    ],
    fixes: [
      { symptom: 'Dashboard numbers do not match the Rooms page', causes: ['Different date or property selected', 'Page not refreshed after recent changes', 'Counting rule differs (occupied vs booked)'], steps: ['Check the property switcher and today’s date.', 'Refresh the page.', 'Still different: note both numbers and the time, and send to support with screenshots.'] },
    ],
  },
  {
    slug: 'bookings', group: 'Modules', title: 'Bookings', where: 'Daily operations › Bookings (Booking List · Booking Calendar · Room Board)', plan: 'All plans', status: 'Live',
    summary: 'Every booking from every source in one list and one calendar. A room cannot be sold twice for the same night.',
    sections: [
      { heading: 'Views', list: ['Booking List — Easy or Detailed', 'Booking Calendar — rooms × days', 'Room Board — every room’s current state'] },
      { heading: 'Create a booking', steps: ['Click “New Booking” (Dashboard or Bookings).', 'Choose check-in and check-out dates, room type and room.', 'Pick a new or existing guest and fill in details.', 'Add payment details and confirm.'] },
      { heading: 'Sources', text: 'BinGi Marketplace, your website and walk-in/phone bookings land in the same list with one booking ID. OTA bookings will join when the channel manager launches (coming soon).' },
      { heading: 'Next version (in testing, not live)', list: ['Today screen: arrivals, in-house and departures with one-tap check-in / check-out', 'Room board with drag to move a stay; group booking; quick walk-in', 'Waitlist when the hotel is full', 'Online pre-check-in link for guests (ID and arrival time before they come)', 'Security deposit held and returned', 'Day close (night audit) with the guest register and Form-C', 'Meals and other services added to the booking'] },
    ],
    fixes: [
      { symptom: 'A room is not offered for my dates', causes: ['Already booked for at least one night', 'Room blocked for maintenance', 'Room not approved / inactive'], steps: ['Open the Booking Calendar and check every night of the stay.', 'Check the room for a maintenance block.', 'Check the room is active in Rooms.'] },
      { symptom: 'A website or marketplace booking is not in my list', causes: ['Different property selected', 'Filter or date range hides it', 'Booking was not completed by the guest'], steps: ['Clear filters and widen the date range.', 'Check the property switcher.', 'Ask the guest for the confirmation/booking ID and search it.', 'Still missing: send the booking ID to support.'] },
      { symptom: 'Checked out but the room is not ready', causes: ['This is expected: booking status and room readiness are separate'], steps: ['Open Housekeeping and finish the cleaning task.', 'Mark the room ready after inspection.'] },
    ],
  },
  {
    slug: 'rooms', group: 'Modules', title: 'Rooms', where: 'Daily operations › Rooms (shown as “Accommodations” when you have cottages, villas or apartments)', plan: 'All plans', status: 'Live',
    summary: 'Room types (categories), individual rooms, prices, photos and status.',
    sections: [
      { heading: 'Room type form', list: ['Category, room type, max guests, size and bed type', 'Base price, VAT % and service charge % (or keep them in sync with hotel defaults), with a price breakdown', 'Room numbers picked from the master list', 'Up to 10 photos, description and amenities', 'Breakfast / lunch / dinner: none, included or extra with a price'] },
      { heading: 'Set up', steps: ['Add a room type: name, capacity, base price, photos.', 'Add the rooms (numbers/names) of that type.', 'Send for approval if the rooms should appear online.'] },
      { heading: 'Online approval', text: 'Rooms show on the BinGi Marketplace only after BinGi approves them. Needs: at least one real photo and a sensible price.' },
    ],
    fixes: [
      { symptom: 'My room does not appear on the Marketplace', causes: ['Waiting for BinGi approval', 'No real photo', 'Price missing or unrealistic', 'Listing not published'], steps: ['Check the room shows “Approved”.', 'Add at least one clear, real photo.', 'Set a realistic price.', 'Check Website Management › Publishing.', 'Waiting long: contact support with the room name.'] },
    ],
  },
  {
    slug: 'housekeeping', group: 'Modules', title: 'Housekeeping', where: 'Daily operations › Housekeeping', plan: 'Business and above', status: 'Live',
    summary: 'Cleaning tasks, who does them and which rooms are ready.',
    sections: [
      { heading: 'Routine', steps: ['On check-out the room becomes “needs cleaning” and a cleaning task is created.', 'Assign the task to a person.', 'After cleaning, a supervisor inspects.', 'Mark the room ready.'] },
    ],
    fixes: [
      { symptom: 'No cleaning task after check-out', causes: ['Your plan does not include Housekeeping (Starter)', 'Check-out not completed in BinGi'], steps: ['Make sure the booking shows “Checked out”.', 'Check your plan includes Housekeeping.', 'Create the task manually if needed and report the case to support.'] },
    ],
  },
  {
    slug: 'guests-chat', group: 'Modules', title: 'Guests & Chat', where: 'Daily operations › Guests (Guest Directory · Guest Reviews) and Chat', plan: 'All plans', status: 'Live',
    summary: 'Guest profiles, stay history, reviews and real-time chat with guests from the Marketplace and your website.',
    sections: [
      { heading: 'Chat', list: ['Messages list with All and Unread, and a search box.', 'One conversation per booking: pick a booking on the left to open it.', 'Guests write from the BinGi Marketplace / Guest App or your website; enquiries without a booking are marked as enquiries.'] },
      { heading: 'Privacy', text: 'Guest ID documents and phone numbers are personal data. Only share them inside BinGi with staff who need them.' },
      { heading: 'Next version (in testing, not live)', list: ['Enquiries filter and a “Make booking” button', 'Booking card beside the conversation (status, payment, room, dates, due)', 'Quick replies, a payment-details button (your accounts + amount due), location and the online check-in link', 'Unread count in the sidebar', 'Quick replies, payment note and location move from Settings to Chat'] },
    ],
    fixes: [
      { symptom: 'I am not getting guest messages', causes: ['Notifications off', 'Different property selected', 'Role cannot see Chat'], steps: ['Open Chat directly and check the property switcher.', 'Turn on notifications (Settings › Notification rules / your browser).', ACCESS_CHECK] },
    ],
  },
  {
    slug: 'meals', group: 'Modules', title: 'Meals — Restaurant & Bar', where: 'Daily operations › Meals', plan: 'Business (limited) · Ultra (full)', status: 'Live',
    summary: 'Menu, POS orders, kitchen and QR ordering. Orders can be posted to a guest’s room bill.',
    sections: [
      { heading: 'Outlets', text: 'Each restaurant, bar or café is an outlet with its own menu, prices, tables and staff. Switch outlets at the top.' },
      { heading: 'Post an order to a room', steps: ['Create the order in POS.', 'Choose “Post to room” and select the in-house room.', 'The amount appears on that guest’s bill and is paid at check-out.'] },
      { heading: 'Online and QR ordering', text: 'Turn website ordering and QR ordering on or off in Website Management › Publishing & Ordering Channels.' },
    ],
    fixes: [
      { symptom: 'I cannot post an order to a room', causes: ['The guest is not checked in', 'Wrong outlet selected', 'Role cannot post to rooms'], steps: ['Check the guest is “Checked in”.', 'Check the outlet switcher.', ACCESS_CHECK] },
      { symptom: 'QR menu does not open for guests', causes: ['QR ordering is off', 'Old printed QR code'], steps: ['Turn QR ordering on in Website Management › Publishing & Ordering Channels.', 'Reprint the QR code if it was changed.'] },
    ],
  },
  {
    slug: 'staff', group: 'Modules', title: 'Staff (HRM)', where: 'Property & team › Staff (People · Attendance · Schedule · Leave · Payroll · Hiring · Team Operations)', plan: 'Full HRM on Ultra', status: 'Live',
    summary: 'Staff records, attendance, shifts, leave and payroll.',
    sections: [
      { heading: 'Attendance', text: 'Attendance can be manual, from an attendance device, or turned off — set in Settings › Attendance Policy; devices are connected in Settings › Connectivity › Attendance Devices.' },
      { heading: 'Staff accounts', text: 'Each person has one BinGi ID. Invite staff by phone; they accept and get the pages of their role.' },
    ],
    fixes: [
      { symptom: 'Attendance from the device is missing', causes: ['Device not connected', 'Staff not mapped to the device ID', 'Attendance policy set to Manual'], steps: ['Check Settings › Connectivity › Attendance Devices shows the device connected.', 'Check each staff member’s device ID.', 'Check Settings › Attendance Policy.'] },
      { symptom: 'A staff member cannot log in', causes: ['Invite not accepted', 'Account disabled', 'Wrong phone number'], steps: ['Resend the invite from Staff › People.', 'Check the account is active.', 'Use Forgot password with the registered number.'] },
    ],
  },
  {
    slug: 'inventory', group: 'Modules', title: 'Inventory', where: 'Property & team › Inventory', plan: 'Ultra', status: 'Live',
    summary: 'Stock in and out, purchases and low-stock alerts.',
    sections: [{ heading: 'Next version (in testing, not live)', list: ['Several stores (main, kitchen, bar, housekeeping) with transfers', 'Purchase orders and receiving in parts', 'Stock count with manager approval', 'Recipes that use stock when food is sold', 'Store keeper / manager approvals'] }],
    fixes: [{ symptom: 'Stock count looks wrong', causes: ['A purchase not received', 'Usage or wastage not recorded'], steps: ['Check pending purchases.', 'Record missing usage or wastage with a note.', 'Adjust the stock with a note and tell your manager.'] }],
  },
  {
    slug: 'other-services', group: 'Modules', title: 'Other Services', where: 'Property & team › Other Services', plan: 'Business and above',
    summary: 'Extra services you sell (for example laundry, transport) that can be added to a guest’s bill.',
    sections: [{ heading: 'Use', steps: ['Create the service with a price.', 'Add it to an in-house guest’s bill.'] }],
  },
  {
    slug: 'discounts-rates', group: 'Modules', title: 'Discounts & Rates', where: 'Money & pricing › Discounts & Rates', plan: 'All plans', status: 'Live',
    summary: 'Discount campaigns: coupon codes and automatic deals. Room prices are set per room type in Rooms.',
    sections: [
      { heading: 'Next version (in testing, not live)', list: ['A rates calendar: price by date for each room type', 'Campaigns and rates in one place'] },
    ],
  },
  {
    slug: 'payments', group: 'Modules', title: 'Payments', where: 'Money & pricing › Payments', plan: 'All plans', status: 'Live',
    summary: 'Every payment guests made, with totals and an export.',
    sections: [
      { heading: 'What you see', list: ['Total revenue, balance due, total collected and average transaction', 'Revenue trend (3 months, 6 months, 1 year, all)', 'Recent transactions: payment ID, booking ID, guest, total, paid, method, gateway / transaction, date', 'Export report'] },
      { heading: 'Take a payment or refund', steps: ['Open the booking (Bookings › booking).', 'Use Payment / Take payment, or Refund when the guest paid more than the bill.', 'Cash payments go into the open Cashbox. Card, bKash and bank are recorded with their reference.'] },
      { heading: 'Next version (in testing, not live)', list: ['One ledger for rooms, restaurant and other services, filtered by source, method and type', '“To collect” list: guests leaving today first, then in-house, then arrivals', '“Refunds due” list; refunds are made from the booking so bill, receipt and Cashbox stay in step', 'Receipt for any payment', 'Net received by day, and totals by method'] },
    ],
    fixes: [
      { symptom: 'A payment is missing from Payments', causes: ['It was posted to the room bill (paid later at check-out)', 'Different property or date range', 'Recorded on a different booking'], steps: ['Check the property switcher and widen the date range.', 'Open the guest’s booking and look at Bill & payments.', 'Restaurant / service charges posted to a room show only when the booking is paid.'] },
    ],
  },
  {
    slug: 'cashbox', group: 'Modules', title: 'Cashbox', where: 'Money & pricing › Cashbox', plan: 'All plans', status: 'Live',
    summary: 'The cash drawer: open the day with a float, every cash in and out, then count and close.',
    sections: [
      { heading: 'Daily routine', steps: ['Open the cashbox with the opening float.', 'Cash payments from bookings, restaurant and services post here by themselves.', 'Record cash out (bank deposit, owner withdrawal, petty expense, refund). Large amounts need the approving manager’s name.', 'At closing, count the notes, explain any difference, keep a float for tomorrow and deposit the rest.'] },
      { heading: 'Mistakes', text: 'Cash entries are never deleted. A wrong entry is fixed with a reversal, so the history stays honest.' },
      { heading: 'Next version (in testing, not live)', list: ['Separate restaurant & bar cashboxes that hand cash over to the main cashbox', 'Expenses paid in cash come out of the main cashbox automatically'] },
    ],
    fixes: [
      { symptom: 'Cashbox does not match the cash in the drawer', causes: ['A cash payment recorded as another method', 'Expense paid from the drawer not recorded', 'Payment entered on the wrong day'], steps: ['Compare today’s cash entries with receipts.', 'Record missing cash out with a note.', 'Fix a wrong entry with a reversal, then count and close again.'] },
      { symptom: 'I cannot take a cash payment', causes: ['The cashbox is not open'], steps: ['Open Cashbox and start the day with the opening float.', 'Or take the payment by another method.'] },
    ],
  },
  {
    slug: 'expenses', group: 'Modules', title: 'Operations (expenses)', where: 'Money & pricing › Operations', plan: 'Business and above', status: 'Live',
    summary: 'Expenses, payroll cost, payees, categories and an audit log in one workspace.',
    sections: [
      { heading: 'Tabs', list: ['Overview: totals, paid and due, approvals, expense trend, revenue vs expense', 'Expenses', 'Payroll', 'Payees', 'Categories', 'Audit logs'] },
      { heading: 'Add an expense', steps: ['Click “New expense”.', 'Enter the title, date, category, payee (optional), amount, payment method and a note.', 'Save.'] },
      { heading: 'Next version (in testing, not live)', list: ['Sidebar name changes to “Expenses”', 'Expenses above an approval limit wait for a manager before they can be paid', 'Part payments; cash payments come out of the Cashbox', 'Supplier bills from Inventory goods received (pay a bill in one step)', 'Petty cash from Cashbox shown in the same list', 'Payroll shown as a cost only — it is run and paid in Staff', '“Left after costs”: money received minus money spent'] },
    ],
    fixes: [
      { symptom: 'I cannot pay an expense', causes: ['It is waiting for approval', 'It was rejected', 'Cash: the cashbox is closed or has too little cash'], steps: ['Ask a manager to approve it.', 'Open Cashbox, or pay by bank / bKash with the reference.'] },
    ],
  },
  {
    slug: 'finance', group: 'Modules', title: 'Finance', where: 'Money & pricing › Finance', plan: 'All plans', status: 'Live',
    summary: 'Your account with BinGi: money guests paid online through BinGi, BinGi’s deductions, and payouts to you.',
    sections: [
      { heading: 'Tabs', list: ['Overview', 'Statement', 'Commissions', 'Subscription invoices', 'Ledger', 'Settlements', 'Refunds'] },
      { heading: 'The numbers', table: { head: ['Name', 'Meaning'], rows: [
        ['Total collected', 'Money guests paid online through BinGi'],
        ['Commission', 'BinGi booking fee for marketplace and website bookings (see your plan)'],
        ['Gateway fees', 'Charged by the online payment gateway'],
        ['SMS & email cost', 'Messages sent for your property'],
        ['Refunded', 'Online refunds'],
        ['Hotel payable', 'What BinGi owes you after deductions'],
        ['Pending settlement', 'Payouts you requested that are not paid yet (held)'],
        ['Available balance', 'Ready to request as a payout now'],
      ] } },
      { heading: 'Request a payout', steps: ['Open Finance › Settlements.', 'Pick the period and the account BinGi should send to (accounts come from Settings › Payments).', 'Submit. BinGi (Super Admin) processes it; the status changes from Requested to Paid.'] },
      { heading: 'Cash and card at the hotel', text: 'Money taken at the hotel never passes through BinGi, so it is not in Finance. See Payments and Cashbox.' },
      { heading: 'Next version (in testing, not live)', list: ['Four tabs: Overview, Ledger, Payouts, Statement (commissions and refunds become ledger filters)', 'Subscription invoices only in Settings › Billing & plan', 'Cancel a payout request while it is still Requested', 'Monthly statement with print'] },
    ],
    fixes: [
      { symptom: 'Available balance is lower than total collected', causes: ['Deductions: commission, gateway fees, SMS & email cost, refunds', 'A payout request is pending and holds part of the balance'], steps: ['Open the Ledger to see each deduction.', 'Check Settlements for a Requested payout.'] },
      { symptom: 'No account to choose for a payout', causes: ['No bKash or bank account saved'], steps: ['Add the account in Settings › Payments, then come back to Settlements.'] },
    ],
  },
  {
    slug: 'reports', group: 'Modules', title: 'Reports', where: 'Reports & online › Reports', plan: 'All plans', status: 'Live',
    summary: 'One workspace with shared filters and exports: sales, revenue, bookings, occupancy, guests, payments, expenses and meals.',
    sections: [
      { heading: 'Reports', list: ['Master sales', 'Daily sales', 'Sales register', 'Dashboard summary', 'Revenue report', 'Booking report', 'Occupancy report', 'Guest report', 'Payment report', 'Expense report', 'Meal report'] },
      { heading: 'Filters and export', list: ['Shared date range: today, yesterday, last 7 / 30 days, this month, last month or custom', 'Export the active report as PDF or Excel (XLSX), or print it', 'Each table: sort by any column, and download as CSV'] },
      { heading: 'Words used', table: { head: ['Word', 'Meaning'], rows: [
        ['Occupancy', 'Sold room-nights ÷ room-nights open (out-of-order rooms are not open)'],
        ['ADR', 'Average room price per sold night (before VAT & service)'],
        ['RevPAR', 'Room revenue per room-night open'],
        ['Net cash', 'Collections − refunds − expenses paid'],
      ] } },
      { heading: 'Tip', text: 'Always check the date range and property before comparing numbers.' },
      { heading: 'Next version (in testing, not live)', list: ['Reports grouped as Sales, Rooms, Money and Departments; only reports your plan includes are shown', 'Revenue & profit (costs include payroll paid)', 'Restaurant, other services, inventory and staff cost reports', 'Bookings › Reports keeps a short front-desk view with a link to all reports'] },
    ],
  },
  {
    slug: 'communication', group: 'Modules', title: 'Communication Center', where: 'Reports & online › Communication Center', plan: 'All plans', status: 'Live',
    summary: 'Automatic emails and SMS to guests and your team, credits, delivery rules and history.',
    sections: [
      { heading: 'Tabs', list: ['Dashboard: email and SMS credit balance, today’s messages, monthly usage and cost', 'Delivery policy: email first, SMS only when needed (profiles: Default, Safe, Cost-aware, High-priority), fallback delay, retries, sender identity', 'Notification events: each event (booking confirmed, cancelled, check-in reminder, room ready, order received …) with email / SMS and “Edit template”', 'Communication credits and Purchase credits', 'Communication history and Delivery reports'] },
      { heading: 'Credits', text: 'Your plan includes monthly email and SMS credits. Buy more in Purchase credits when they run low. Message cost shows in Finance as “SMS & email”.' },
      { heading: 'Next version (in testing, not live)', list: ['Automatic messages grouped as Booking, Stay, Payments, Restaurant & services and Team alerts', 'Message text editor with a live preview and an SMS part counter (Bangla uses 70 characters per part)', 'Send a message from history; resend a failed one', 'Settings › Guest messages becomes a link here (one home)'] },
    ],
    fixes: [{ symptom: 'SMS is not being sent', causes: ['SMS credits finished', 'Event turned off for SMS', 'Wrong phone format', 'Delivery policy: SMS only when email fails'], steps: ['Check the SMS credit balance on the Dashboard tab.', 'Check the event is on for SMS in Notification events.', 'Check the guest’s number (with country code).', 'Check the Delivery policy.', 'Look at Communication history for the error.'] }],
  },
  {
    slug: 'website', group: 'Modules', title: 'Website Management', where: 'Reports & online › Website Management (Theme & Appearance · Pages & Content · Publishing & Ordering Channels)', plan: 'All plans (themes by plan)', status: 'Live',
    summary: 'Your own hotel website with a booking engine. Bookings land in your HMS.',
    sections: [
      { heading: 'Themes by plan', table: { head: ['Plan', 'Themes'], rows: [['Starter', 'NEST · COTTAGE · BUNK'], ['Business', '+ CITY · VILLA · FLAT · ESCAPE'], ['Ultra / Custom', 'All, including GRAND']] } },
      { heading: 'Publish', steps: ['Choose a theme and colour.', 'Edit text and photos.', 'Publish in Publishing & Ordering Channels. Changes stay a draft until you publish.'] },
      { heading: 'Domain', text: 'Connect your own domain from Website Management; until then the site uses a BinGi address.' },
      { heading: 'Theme Store (coming soon)', text: '21 premium themes as an add-on on any plan: ৳50 per theme per month, free for now. In testing.' },
      { heading: 'Premium collections (in testing, not live)', table: { head: ['Collection', 'Themes'], rows: [
        ['Paid', 'DRIFT · CANOPY · POD · ORBIT'],
        ['Luxury', 'ISLE · ESTATE · SUMMIT · HAVEN · NOIR · MAISON · ZAMINDAR'],
        ['Signature', 'AUREL · COURTYARD · AXIS · WAYPOINT · SHANTI · RESIDE · COMMONS · ROOTS · MORNING · MATIR'],
      ] } },
      { heading: 'Website pages', list: ['Home · Rooms (each room with photos, price and booking) · Offers · Dining (Ultra) · Experiences · Explore · Events · Policies', 'Guests book and pay the advance on your website; the booking lands in your HMS with one booking ID', 'Guests can check in online before arrival (in testing)'] },
      { heading: 'Online On/Off', text: 'Pause website booking, marketplace, website food ordering or QR ordering at any time. Pausing stops new requests only; existing bookings stay.' },
    ],
    fixes: [
      { symptom: 'My changes do not show on the website', causes: ['Changes saved as draft, not published', 'Browser shows an old copy'], steps: ['Click Publish.', 'Reload the website (or open it in a private window).'] },
      { symptom: '“Domain not connected”', causes: ['DNS records not added at your domain provider', 'DNS still updating (can take hours)'], steps: ['Add the DNS records shown in Website Management at your domain provider.', 'Wait and check again later.', 'Still failing after 24 hours: send the domain name to support.'] },
      { symptom: 'A theme is locked', causes: ['Your plan does not include that theme'], steps: ['Pick a theme of your plan, or upgrade in Finance › Billing & Subscription.'] },
    ],
  },
  {
    slug: 'settings', group: 'Modules', title: 'Settings', where: 'Sidebar bottom › Settings', plan: 'All plans',
    summary: 'Property profile, policies, taxes, users and roles, connectivity and your personal preferences.',
    sections: [{ heading: 'Main areas', table: { head: ['Area', 'Contains'], rows: [
      ['Property', 'Property Profile · Branding · Regional Settings'],
      ['Operations', 'Booking Policies · Pricing & Taxes · Operations Defaults · Restaurant & Inventory · Attendance Policy'],
      ['Distribution', 'Booking Channels · Website & Marketplace'],
      ['Money', 'Guest Payments · Invoices & Printing · Billing & Subscription'],
      ['Communication', 'Guest Messaging'],
      ['Access', 'Users & Roles · Security & Sessions · Branch Management'],
      ['Connectivity', 'SMS Gateway · Payment Gateway · Printers · Attendance Devices'],
      ['Personal Preferences', 'Appearance & Accessibility (size, density, sidebar mode, language)'],
    ] } },
    { heading: 'Next version (in testing, not live)', list: ['Search inside Settings', 'One home for each setting: guest messages move to Communication Center, chat replies to Chat, booking settings to Settings › Booking policies, subscription invoices to Billing & plan', 'Ask before leaving a page with unsaved changes'] }],
  },
  // ───────────────────────── ACCOUNT
  {
    slug: 'plans-billing', group: 'Account', title: 'Plans, pricing and billing',
    summary: 'You pay per room per month. Every charge is shown separately.',
    sections: [
      { heading: 'Prices (per room, per month)', table: { head: ['Plan', 'Price', 'Activation', 'Booking fee: Marketplace / Website / Walk-in'], rows: [
        ['Starter', '৳25 (always) · 6 mo ৳23 · 12 mo ৳19', 'None', '12% / 1.5% / 0%'],
        ['Business', '৳70 (regular ৳175) · 6 mo ৳63 · 12 mo ৳53', '৳14,500 — currently ৳4,999', '8% / 1% / 0%'],
        ['Ultra', '৳116 (regular ৳290) · 6 mo ৳105 · 12 mo ৳87', '৳29,500 — currently ৳8,999', '4% / 0.5% / 0%'],
        ['Custom', 'Quotation', '—', '—'],
      ] } },
      { heading: 'Rules', list: ['Starter is always ৳25. Business and Ultra prices are a launch offer, about 60% off the regular price (Business ৳175 · Ultra ৳290). The offer runs until 11 Feb 2027; hotels that join by then keep the launch price.', 'Minimum billing is 10 rooms.', 'Pay 6 months: about 10% off. Pay 12 months: about 25% off. Per-room rates are rounded to whole taka.', 'Price = rooms × per-room rate for your cycle × months. No VAT is added at present.', 'SMS and email go through your own provider (Settings → Connectivity). Their charges are paid to them directly. If no provider is connected, guest OTP and SMS are not sent.', 'Walk-in bookings at reception have no booking fee.'] },
      { heading: 'What each plan adds', table: { head: ['Plan', 'Adds'], rows: [
        ['Starter', 'Room/accommodation management · online & offline bookings · website management · domain management · limited website themes'],
        ['Business', 'Everything in Starter + housekeeping · restaurant/meal management (limited) · QR food ordering · expense management · other services'],
        ['Ultra', 'Everything in Business + full restaurant & bar · full HRM · inventory · advanced operations · all website themes'],
        ['Custom', 'Several properties, your modules and workflow, migration and dedicated onboarding'],
      ] } },
      { heading: 'Which plan for which property', table: { head: ['Property', 'Suggested plan'], rows: [['Home / flat', 'Starter'], ['Guest house', 'Starter'], ['Hotel', 'Business'], ['Resort', 'Ultra'], ['Hotel group', 'Custom']] } },
      { heading: 'See or change your plan', text: 'Billing & Subscription in the sidebar (Money & pricing). In the next version it lives in Settings › Billing & plan.' },
    ],
    fixes: [{ symptom: 'My bill is higher than expected', causes: ['Minimum 10 rooms applies', 'Taxes added', 'Booking fees from marketplace/website bookings'], steps: ['Check the room count on the bill.', 'Check the tax line.', 'Check booking-fee lines by source.', 'Questions: send the bill number to support.'] }],
  },
  // ───────────────────────── HELP
  {
    slug: 'troubleshooting', group: 'Help', title: 'Troubleshooting checklist',
    summary: 'Try these first — they solve most issues.',
    sections: [
      { heading: 'First checks', steps: [
        ACCESS_CHECK,
        'Refresh the page (or close and reopen the app).',
        'Check your internet connection.',
        'Try another browser or a private window.',
        'Check the date range and filters on the page.',
        'Note the exact error message, the time, and take a screenshot.',
      ] },
      { heading: 'Then', text: 'Look up your module’s page in these docs (each has a “Common issues” section), or give the full docs to an AI with the issue template (see “Fix an issue with AI”).' },
    ],
  },
  {
    slug: 'faq', group: 'Help', title: 'Frequently asked questions',
    summary: 'Short answers to what people ask most.',
    sections: [{ heading: 'Questions', table: { head: ['Question', 'Answer'], rows: [
      ['What is BinGi?', 'Hotel Management Technology by NEONECY (Dhaka): website, bookings, front desk, housekeeping, restaurant, staff, money and reports in one connected system.'],
      ['How much does it cost?', 'Per room per month: Starter ৳25, Business ৳70, Ultra ৳116 (launch offer; minimum 10 rooms). See “Plans, pricing and billing”.'],
      ['Is there a free trial?', 'Yes — create your account, set up your property and start a seven-day free trial.'],
      ['Does BinGi connect to Booking.com / Agoda?', 'Not yet. The channel manager (OTA connections) is coming soon.'],
      ['Can guests pay online?', 'It depends on the payment options turned on for your property (Settings › Payments). Online payments that pass through BinGi show in Finance. BinGi Payments as a full payment service is coming soon.'],
      ['Is BinGi AI available?', 'As a beta, by invitation: it runs on your own computer and connects with your BinGi API access. Ask the BinGi team on WhatsApp. It is not inside the HMS yet.'],
      ['Can I use my own domain?', 'Yes — connect it in Website Management › Domain. Until then the site uses a free BinGi address.'],
      ['Can I manage several properties?', 'Yes. One login can manage several properties; switch at the top. Hotel groups use the Custom plan.'],
      ['Is the HMS in Bangla?', 'Yes, the interface can be English or Bangla.'],
      ['Which plan has the restaurant?', 'Business (limited) and Ultra (full restaurant & bar).'],
      ['Where do I see what BinGi owes me?', 'Finance › Overview (available balance) and Settlements (payouts).'],
    ] } }],
  },
  {
    slug: 'glossary', group: 'Help', title: 'Glossary',
    summary: 'Words used in BinGi.',
    sections: [{ heading: 'Terms', table: { head: ['Term', 'Meaning'], rows: [
      ['Property', 'One hotel, resort, guest house or home managed in BinGi'],
      ['Room type / category', 'A group of similar rooms with one base price'],
      ['Booking ID', 'The single number that follows a booking from start to finish'],
      ['Folio / room bill', 'Everything a guest owes for the stay'],
      ['Walk-in', 'A guest who books at reception'],
      ['Outlet', 'A restaurant, bar, café or similar point of sale'],
      ['Store', 'A place where stock is kept'],
      ['Cashbox', 'The cash drawer and its daily open/close'],
      ['Marketplace', 'bingi.app, where guests find and book properties'],
      ['Booking engine', 'The booking part of your own website'],
      ['OTA', 'Online travel agency (for example Booking.com) — channel manager coming soon'],
      ['Activation', 'One-time fee when starting a plan'],
      ['Role', 'A set of permissions given to a user'],
      ['Settlement / payout', 'Money BinGi sends you from your available balance'],
      ['Commission / booking fee', 'BinGi’s % on marketplace and website bookings (by plan)'],
      ['Float', 'Cash kept in the drawer to start the day'],
      ['Reversal', 'A new entry that cancels a wrong cash entry (nothing is deleted)'],
      ['Out of order', 'A room that cannot be sold for some dates (maintenance)'],
      ['Credits', 'Email / SMS messages you can still send'],
    ] } }],
  },
  {
    slug: 'support', group: 'Help', title: 'Contact support',
    summary: 'When the docs and the AI cannot solve it.',
    sections: [
      { heading: 'Reach us', text: SUPPORT },
      { heading: 'Send this', list: ['Property name', 'Your role and plan', 'Page name', 'What you did, what you expected, what happened', 'Exact error text and a screenshot', 'Booking ID / room / bill number if related'] },
      { heading: 'Never send', list: ['Passwords or OTP codes', 'Full card numbers'] },
    ],
  },
]

// ───────── Markdown (for "Copy for AI", per-page .md, /llms.txt and /llms-full.txt)
export function pageToMarkdown(p: DocPage): string {
  const out: string[] = [`# ${p.title}`, '', p.summary, '']
  const meta = [p.where && `Where: ${p.where}`, p.plan && `Plan: ${p.plan}`, p.status && `Status: ${p.status}`].filter(Boolean)
  if (meta.length) out.push(...meta.map((m) => `- ${m}`), '')
  for (const s of p.sections) {
    out.push(`## ${s.heading}`, '')
    if (s.text) out.push(s.text, '')
    if (s.list) out.push(...s.list.map((x) => `- ${x}`), '')
    if (s.steps) out.push(...s.steps.map((x, i) => `${i + 1}. ${x}`), '')
    if (s.table) {
      out.push(`| ${s.table.head.join(' | ')} |`, `| ${s.table.head.map(() => '---').join(' | ')} |`, ...s.table.rows.map((r) => `| ${r.join(' | ')} |`), '')
    }
  }
  if (p.fixes?.length) {
    out.push('## Common issues', '')
    for (const f of p.fixes) {
      out.push(`### ${f.symptom}`, '', `Likely causes: ${f.causes.join('; ')}.`, '', 'Fix:', ...f.steps.map((x, i) => `${i + 1}. ${x}`), '')
    }
  }
  return out.join('\n')
}

export const AI_INSTRUCTIONS = `You are helping a user of BinGi Hotel Management Technology (by NEONECY, Bangladesh).
Rules for you, the AI assistant:
- Answer ONLY from this documentation. If the answer is not here, say so and tell the user to contact BinGi support: ${SUPPORT}.
- Ask for the user's role, plan, platform and page if they did not say.
- Give short numbered steps with the exact page names used here.
- Always check the three gates first: plan, role permission, selected property.
- Booking status, payment status, room readiness and maintenance status are separate — never mix them.
- Features marked "Coming soon" are NOT available; never tell the user to use them.
- Sections titled "Next version (in testing, not live)" describe a redesign that users cannot use yet. Explain the current (live) way first; mention the next version only if asked.
- BinGi AI is a beta for invited hotels (runs locally, connects via BinGi API access). It is not inside the HMS; do not tell users to open it there.
- Never ask for passwords, OTP codes or card numbers.
- Reply in the user's language (Bangla or English).`

export function fullMarkdown(siteUrl = 'https://technology.bingi.com.bd'): string {
  return [
    `# BinGi documentation (${DOCS_VERSION})`, '', `Source: ${siteUrl}/docs`, '',
    '## Instructions for AI assistants', '', AI_INSTRUCTIONS, '',
    ...docs.map((p) => `---\n\n${pageToMarkdown(p)}`),
  ].join('\n')
}

export function llmsIndex(siteUrl = 'https://technology.bingi.com.bd'): string {
  const groups = [...new Set(docs.map((d) => d.group))]
  return [
    '# BinGi', '', '> BinGi Hotel Management Technology — one connected system for a property’s website, bookings, front desk, housekeeping, restaurant, staff, money and reports. Built by NEONECY, Dhaka.', '',
    `Full documentation in one file: ${siteUrl}/llms-full.txt`, '',
    ...groups.flatMap((g) => [`## ${g}`, '', ...docs.filter((d) => d.group === g).map((d) => `- [${d.title}](${siteUrl}/docs/${d.slug}.md): ${d.summary}`), '']),
  ].join('\n')
}
