// BinGi public documentation — ONE source for the /docs pages, per-page Markdown, /llms.txt and /llms-full.txt.
// Written so a person OR any LLM can read it and fix a user's issue.
// Sources: Sidebar v6 (names follow the live HMS), module rules, pricing data, status registry, staging check 9 Nov 2026.
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
  status?: 'Live' | 'Coming soon' | 'Rolling out'
  sections: DocSection[]
  fixes?: Fix[]
}

export const DOCS_VERSION = 'v0.1 draft · 10 November 2026'
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
        ['Super Admin', 'BinGi team (approvals, plans, support)', 'Internal', 'Internal'],
      ] } },
      { heading: 'Properties and roles', list: [
        'One login can manage one or more properties; switch with the property switcher at the top.',
        'Each user has a role (for example owner, manager, receptionist, housekeeping, waiter, accountant). The role decides which pages and buttons they see.',
        'Staff join with an invite and their own BinGi ID; one person keeps one BinGi account.',
      ] },
      { heading: 'Coming soon (not live)', list: ['Channel manager / OTA connections (Booking.com, Agoda and others)', 'BinGi Payments (online payments through BinGi)', 'Developer API', 'BinGi AI', 'Theme Store (paid themes)'] },
    ],
  },
  {
    slug: 'navigation', group: 'Platform', title: 'Finding your way in the HMS',
    summary: 'The sidebar is grouped by how often you use each page.',
    sections: [
      { heading: 'Sidebar groups', table: { head: ['Group', 'Pages'], rows: [
        ['Daily operations', 'Dashboard · Bookings · Rooms · Housekeeping · Guests · Chat · Meals'],
        ['Property & team', 'Staff · Inventory · Other Services'],
        ['Money & pricing', 'Discounts & Rates · Payments · Cashbox · Finance'],
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
      { heading: 'Privacy', text: 'Guest ID documents and phone numbers are personal data. Only share them inside BinGi with staff who need them.' },
    ],
    fixes: [
      { symptom: 'I am not getting guest messages', causes: ['Notifications off', 'Different property selected', 'Role cannot see Chat'], steps: ['Open Chat directly and check the property switcher.', 'Turn on notifications (Settings › Notification rules / your browser).', ACCESS_CHECK] },
    ],
  },
  {
    slug: 'meals', group: 'Modules', title: 'Meals — Restaurant & Bar', where: 'Daily operations › Meals', plan: 'Business and above (per current pricing)', status: 'Live',
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
    summary: 'Stock in and out, purchases and low-stock alerts, by store.',
    sections: [{ heading: 'Stores', text: 'Stock is kept per store (for example central store, kitchen, bar, housekeeping). Purchases come into a store; items move between stores.' }],
    fixes: [{ symptom: 'Stock count looks wrong', causes: ['Wrong store selected', 'A purchase or transfer not received', 'Usage not recorded'], steps: ['Check the store switcher.', 'Check pending purchases/transfers.', 'Do a stock count and adjust with a note.'] }],
  },
  {
    slug: 'other-services', group: 'Modules', title: 'Other Services', where: 'Property & team › Other Services', plan: 'Business and above',
    summary: 'Extra services you sell (for example laundry, transport) that can be added to a guest’s bill.',
    sections: [{ heading: 'Use', steps: ['Create the service with a price.', 'Add it to an in-house guest’s bill.'] }],
  },
  {
    slug: 'money', group: 'Modules', title: 'Money: Rates, Payments, Cashbox, Finance', where: 'Money & pricing › Discounts & Rates · Payments · Cashbox · Finance', plan: 'All plans (Expenses: Business and above)', status: 'Live',
    summary: 'Room rates and discounts, guest payments, the cash drawer, expenses and your BinGi subscription.',
    sections: [
      { heading: 'Pages', table: { head: ['Page', 'Use it for'], rows: [
        ['Discounts & Rates', 'Rates Calendar (room rates through the year) and discounts'],
        ['Payments', 'Payments received from guests'],
        ['Cashbox', 'Cash in the drawer; open and close the day'],
        ['Finance', 'Finance Overview · Expenses & Accounts · Billing & Subscription (your BinGi plan and bills)'],
      ] } },
    ],
    fixes: [
      { symptom: 'Cashbox does not match the cash in the drawer', causes: ['A cash payment recorded as another method', 'Expense paid from the drawer not recorded', 'Payment entered on the wrong day'], steps: ['Compare today’s payments list with receipts.', 'Record missing cash expenses.', 'Correct the payment method, then close the day again.'] },
      { symptom: 'Guest bill total looks wrong', causes: ['Taxes or service charge settings', 'An order posted to the wrong room', 'Discount applied twice'], steps: ['Open the bill and check each line.', 'Check Settings › Pricing & Taxes.', 'Move a wrong charge to the correct room.'] },
    ],
  },
  {
    slug: 'reports', group: 'Modules', title: 'Reports', where: 'Reports & online › Reports', plan: 'All plans', status: 'Live',
    summary: 'Occupancy, revenue, booking sources, payments, expenses and staff reports.',
    sections: [{ heading: 'Tip', text: 'Always check the date range and property before comparing numbers.' }],
  },
  {
    slug: 'communication', group: 'Modules', title: 'Communication Center', where: 'Reports & online › Communication Center', plan: 'All plans', status: 'Live',
    summary: 'SMS and email to guests, with templates.',
    sections: [{ heading: 'Setup', text: 'SMS needs an SMS gateway (Settings › Connectivity › SMS Gateway). Message templates live in Settings › Guest Messaging.' }],
    fixes: [{ symptom: 'SMS is not being sent', causes: ['SMS gateway not connected', 'SMS balance finished', 'Wrong phone format'], steps: ['Check Settings › Connectivity › SMS Gateway.', 'Check your SMS balance.', 'Use the full number with country code.'] }],
  },
  {
    slug: 'website', group: 'Modules', title: 'Website Management', where: 'Reports & online › Website Management (Theme & Appearance · Pages & Content · Publishing & Ordering Channels)', plan: 'All plans (themes by plan)', status: 'Live',
    summary: 'Your own hotel website with a booking engine. Bookings land in your HMS.',
    sections: [
      { heading: 'Themes by plan', table: { head: ['Plan', 'Themes'], rows: [['Starter', 'NEST · COTTAGE · BUNK'], ['Business', '+ CITY · VILLA · FLAT · ESCAPE'], ['Ultra / Custom', 'All, including GRAND']] } },
      { heading: 'Publish', steps: ['Choose a theme and colour.', 'Edit text and photos.', 'Publish in Publishing & Ordering Channels. Changes stay a draft until you publish.'] },
      { heading: 'Domain', text: 'Connect your own domain from Website Management; until then the site uses a BinGi address.' },
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
    ] } }],
  },
  // ───────────────────────── ACCOUNT
  {
    slug: 'plans-billing', group: 'Account', title: 'Plans, pricing and billing',
    summary: 'You pay per room per month. Every charge is shown separately.',
    sections: [
      { heading: 'Prices (per room, per month)', table: { head: ['Plan', 'Price', 'Activation', 'Booking fee: Marketplace / Website / Walk-in'], rows: [
        ['Starter', '৳25 (regular ৳63) · 6 mo ৳23 · 12 mo ৳19', 'None', '12% / 1.5% / 0%'],
        ['Business', '৳70 (regular ৳175) · 6 mo ৳63 · 12 mo ৳53', '৳14,500 — currently ৳4,999', '8% / 1% / 0%'],
        ['Ultra', '৳116 (regular ৳290) · 6 mo ৳105 · 12 mo ৳87', 'Currently ৳8,999', '4% / 0.5% / 0%'],
        ['Custom', 'Quotation', '—', '—'],
      ] } },
      { heading: 'Rules', list: ['Current prices are a launch offer, about 60% off the regular price (Starter ৳63 · Business ৳175 · Ultra ৳290). Regular prices may apply later; you will be told in advance.', 'Minimum billing is 10 rooms.', 'Pay 6 months: about 10% off. Pay 12 months: about 25% off. Per-room rates are rounded to whole taka.', 'Price = rooms × per-room rate for your cycle × months. VAT is a separate line.', 'SMS and email go through your own provider (Settings → Connectivity). Their charges are paid to them directly. If no provider is connected, guest OTP and SMS are not sent.', 'Walk-in bookings at reception have no booking fee.'] },
      { heading: 'What each plan adds', table: { head: ['Plan', 'Adds'], rows: [
        ['Starter', 'Room/accommodation management · online & offline bookings · website management · domain management · limited website themes'],
        ['Business', 'Everything in Starter + housekeeping · restaurant/meal management · QR food ordering · expense management · other services'],
        ['Ultra', 'Everything in Business + full HRM · inventory · advanced operations · all website themes'],
        ['Custom', 'Several properties, your modules and workflow, migration and dedicated onboarding'],
      ] } },
      { heading: 'Which plan for which property', table: { head: ['Property', 'Suggested plan'], rows: [['Home / flat', 'Starter'], ['Guest house', 'Starter'], ['Hotel', 'Business'], ['Resort', 'Ultra'], ['Hotel group', 'Custom']] } },
      { heading: 'See or change your plan', text: 'Finance › Billing & Subscription.' },
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
