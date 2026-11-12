// Every place a custom GIF / video / screenshot can go.
// Drop the file into /public/media/ and put its path in `src`. Empty src = labelled placeholder.
// Tip: prefer .mp4/.webm (autoplay muted loop) over .gif — 5–10× smaller, same look.
export type Slot = { src?: string; poster?: string; w: number; h: number; note: string }

export const media = {
  heroWeb:        { src: '/media/hms/dash.mp4', poster: '/media/hms/dash.webp', w: 2560, h: 1440, note: 'HMS Web — Dashboard (screenshot or GIF)' },
  heroPhone:      { src: '/media/hms/guest.mp4', poster: '/media/hms/guest.webp', w: 1320, h: 2868, note: 'Guest App — Home (iPhone 16 Pro Max)' },
  platformWeb:    { src: '/media/hms/calendar.mp4', poster: '/media/hms/calendar.webp', w: 2560, h: 1440, note: 'HMS Web — Booking Calendar' },
  platformMobile: { src: '/media/hms/mobile.mp4', poster: '/media/hms/mobile.webp', w: 1320, h: 2868, note: 'HMS Mobile — Today screen' },
  platformGuest:  { src: '/media/hms/guest.mp4', poster: '/media/hms/guest.webp', w: 1320, h: 2868, note: 'Guest App — Hotel page / booking' },
  chain:          { w: 1600, h: 900,  note: 'GIF: one booking flowing from website to report' },
  story1:         { src: '/media/hms/bookings.mp4', poster: '/media/hms/bookings.webp', w: 2560, h: 1440, note: 'Booking arrives — website / marketplace / walk-in (Bookings list)' },
  story2:         { src: '/media/hms/calendar.mp4', poster: '/media/hms/calendar.webp', w: 2560, h: 1440, note: 'Room assigned — Booking Calendar' },
  story3:         { src: '/media/hms/checkin.mp4', poster: '/media/hms/checkin.webp', w: 2560, h: 1440, note: 'Check-in — guest + ID + payment' },
  story4:         { src: '/media/hms/pos.mp4', poster: '/media/hms/pos.webp', w: 2560, h: 1440, note: 'Stay — restaurant order posted to the room bill' },
  story5:         { src: '/media/hms/housekeeping.mp4', poster: '/media/hms/housekeeping.webp', w: 2560, h: 1440, note: 'Check-out → housekeeping task → report' },
  bentoCash:      { src: '/media/hms/bentoCash.mp4', poster: '/media/hms/bentoCash.webp', w: 1200, h: 750,  note: 'GIF: cashbox / payments of the day' },
  bentoStaff:     { src: '/media/hms/bentoStaff.mp4', poster: '/media/hms/bentoStaff.webp', w: 1200, h: 750,  note: 'GIF: staff attendance & shifts' },
  bentoCalendar:  { src: '/media/hms/bentoCalendar.mp4', poster: '/media/hms/bentoCalendar.webp', w: 1600, h: 700,  note: 'GIF: drag a booking on the calendar' },
  bentoHousekeep: { src: '/media/hms/bentoHousekeep.mp4', poster: '/media/hms/bentoHousekeep.webp', w: 800,  h: 700,  note: 'GIF: checkout → cleaning task appears' },
  bentoRestaurant:{ src: '/media/hms/bentoRestaurant.mp4', poster: '/media/hms/bentoRestaurant.webp', w: 1200, h: 750,  note: 'GIF: POS order posted to room bill' },
  bentoWebsite:   { src: '/media/hms/bentoWebsite.mp4', poster: '/media/hms/bentoWebsite.webp', w: 2400, h: 800,  note: 'GIF: hotel website theme switch' },
  dashStarter:    { src: '/media/dashStarter.mp4', w: 1600, h: 900, note: 'HMS dashboard — Starter plan' },
  dashBusiness:   { src: '/media/dashBusiness.mp4', w: 1600, h: 900, note: 'HMS dashboard — Business plan' },
  aiHome:         { src: '/media/ai/home.mp4', poster: '/media/ai/home.webp', w: 1600, h: 900, note: 'BinGi AI — Ask BinGi home (beta, sample hotel)' },
  aiAnswer:       { src: '/media/ai/answer.mp4', poster: '/media/ai/answer.webp', w: 1600, h: 900, note: 'BinGi AI — answer with booking cards (beta, sample hotel)' },
  aiBrief:        { src: '/media/ai/brief.mp4', poster: '/media/ai/brief.webp', w: 1600, h: 900, note: 'BinGi AI — Daily Brief (beta, sample hotel)' },
  dashUltra:      { src: '/media/hms/dash.mp4', poster: '/media/hms/dash.webp', w: 1600, h: 900, note: 'HMS dashboard — Ultra plan' },
  helpVideo1:     { w: 1280, h: 720,  note: 'Video: create a booking (1 min, Bangla)' },
  helpVideo2:     { w: 1280, h: 720,  note: 'Video: add rooms (1 min, Bangla)' },
  helpVideo3:     { w: 1280, h: 720,  note: 'Video: collect payment & checkout (1 min, Bangla)' },
} satisfies Record<string, Slot>

export type MediaId = keyof typeof media
