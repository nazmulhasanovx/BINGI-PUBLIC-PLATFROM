// Every place a custom GIF / video / screenshot can go.
// Drop the file into /public/media/ and put its path in `src`. Empty src = labelled placeholder.
// Tip: prefer .mp4/.webm (autoplay muted loop) over .gif — 5–10× smaller, same look.
export type Slot = { src?: string; poster?: string; w: number; h: number; note: string }

export const media = {
  heroWeb:        { src: '/media/hms/dash.mp4', poster: '/media/hms/dash.webp', w: 2560, h: 1440, note: 'HMS Web — Dashboard (screenshot or GIF)' },
  heroPhone:      { src: '/media/hms/guest.mp4', poster: '/media/hms/guest.webp', w: 1320, h: 2868, note: 'Guest App — Home (iPhone 16 Pro Max)' },
  platformWeb:    { src: '/media/hms/calendar.mp4', poster: '/media/hms/calendar.webp', w: 2560, h: 1440, note: 'HMS Web — Booking Calendar' },
  platformMobile: { src: '/media/hms/mobile.mp4', poster: '/media/hms/mobile.webp', w: 1320, h: 2868, note: 'HMS Mobile — Today screen' },
  guestHome:      { src: '/media/guest/home.webp', w: 1186, h: 2576, note: 'Guest App — home (real screenshot)' },
  guestSearch:    { src: '/media/guest/search.webp', w: 1186, h: 2576, note: 'Guest App — search sheet (real screenshot)' },
  guestHotel:     { src: '/media/guest/hotel.webp', w: 1186, h: 2576, note: 'Guest App — hotel page (real screenshot)' },
  guestRoom:      { src: '/media/guest/room.webp', w: 1186, h: 2576, note: 'Guest App — room page (real screenshot)' },
  platformGuest:  { src: '/media/hms/guest.mp4', poster: '/media/hms/guest.webp', w: 1320, h: 2868, note: 'Guest App — Hotel page / booking' },
  chain:          { w: 1600, h: 900,  note: 'GIF: one booking flowing from website to report' },
  story1:         { src: '/media/hms/bookings.mp4', poster: '/media/hms/bookings.webp', w: 2560, h: 1440, note: 'Booking arrives — website / marketplace / walk-in (Bookings list)' },
  story2:         { src: '/media/hms/calendar.mp4', poster: '/media/hms/calendar.webp', w: 2560, h: 1440, note: 'Room assigned — Booking Calendar' },
  story3:         { src: '/media/hms/checkin.mp4', poster: '/media/hms/checkin.webp', w: 2560, h: 1440, note: 'Check-in — guest + ID + payment' },
  story4:         { src: '/media/hms/pos.mp4', poster: '/media/hms/pos.webp', w: 2560, h: 1440, note: 'Stay — restaurant order posted to the room bill' },
  story5:         { src: '/media/hms/housekeeping.mp4', poster: '/media/hms/housekeeping.webp', w: 2560, h: 1440, note: 'Check-out → housekeeping task → report' },
  bentoCash:      { src: '/media/hms/bentoCash-still.webp', w: 1360, h: 850, note: 'Cashbox: opening float + cash in − cash out (HMS prototype, demo data)' },
  bentoStaff:     { src: '/media/hms/bentoStaff-still.webp', w: 1360, h: 850, note: 'Staff attendance (HMS prototype, demo data)' },
  bentoCalendar:  { src: '/media/hms/bentoCalendar.mp4', poster: '/media/hms/bentoCalendar.webp', w: 1600, h: 700,  note: 'GIF: drag a booking on the calendar' },
  bentoHousekeep: { src: '/media/hms/bentoHousekeep-still.webp', w: 1360, h: 850, note: 'Housekeeping tasks (HMS prototype, demo data)' },
  bentoRestaurant:{ src: '/media/hms/bentoRestaurant-still.webp', w: 1360, h: 850, note: 'Restaurant & bar POS (HMS prototype, demo data)' },
  bentoWebsite:   { src: '/media/hms/bentoWebsite-still.webp', w: 1150, h: 383, note: 'Website Management overview (HMS prototype, demo data)' },
  dashStarter:    { src: '/media/hms/plan-starter.mp4', poster: '/media/hms/plan-starter.webp', w: 1920, h: 1080, note: 'HMS dashboard — Starter plan (Remotion, exact HMS prototype view, demo data)' },
  dashBusiness:   { src: '/media/hms/plan-business.mp4', poster: '/media/hms/plan-business.webp', w: 1920, h: 1080, note: 'HMS dashboard — Business plan (Remotion, exact HMS prototype view, demo data)' },
  aiHome:         { src: '/media/ai/home.mp4', poster: '/media/ai/home.webp', w: 1600, h: 900, note: 'BinGi AI — Ask BinGi home (beta, sample hotel)' },
  aiAnswer:       { src: '/media/ai/answer.mp4', poster: '/media/ai/answer.webp', w: 1600, h: 900, note: 'BinGi AI — answer with booking cards (beta, sample hotel)' },
  aiBrief:        { src: '/media/ai/brief.mp4', poster: '/media/ai/brief.webp', w: 1600, h: 900, note: 'BinGi AI — Daily Brief (beta, sample hotel)' },
  dashUltra:      { src: '/media/hms/plan-ultra.mp4', poster: '/media/hms/plan-ultra.webp', w: 1920, h: 1080, note: 'HMS dashboard — Ultra plan (Remotion, exact HMS prototype view, demo data)' },
  helpVideo1:     { w: 1280, h: 720,  note: 'Video: create a booking (1 min, Bangla)' },
  helpVideo2:     { w: 1280, h: 720,  note: 'Video: add rooms (1 min, Bangla)' },
  helpVideo3:     { w: 1280, h: 720,  note: 'Video: collect payment & checkout (1 min, Bangla)' },
} satisfies Record<string, Slot>

export type MediaId = keyof typeof media
