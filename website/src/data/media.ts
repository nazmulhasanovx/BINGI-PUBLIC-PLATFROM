// Every place a custom GIF / video / screenshot can go.
// Drop the file into /public/media/ and put its path in `src`. Empty src = labelled placeholder.
// Tip: prefer .mp4/.webm (autoplay muted loop) over .gif — 5–10× smaller, same look.
export type Slot = { src?: string; w: number; h: number; note: string }

export const media = {
  heroWeb:        { src: '/media/heroWeb.mp4', w: 2560, h: 1440, note: 'HMS Web — Dashboard (screenshot or GIF)' },
  heroPhone:      { src: '/media/heroPhone.mp4', w: 1320, h: 2868, note: 'Guest App — Home (iPhone 16 Pro Max)' },
  platformWeb:    { src: '/media/platformWeb.mp4', w: 2560, h: 1440, note: 'HMS Web — Booking Calendar' },
  platformMobile: { src: '/media/platformMobile.mp4', w: 1320, h: 2868, note: 'HMS Mobile — Today screen' },
  platformGuest:  { src: '/media/heroPhone.mp4', w: 1320, h: 2868, note: 'Guest App — Hotel page / booking' },
  chain:          { w: 1600, h: 900,  note: 'GIF: one booking flowing from website to report' },
  story1:         { src: '/media/story1.mp4', w: 2560, h: 1440, note: 'Booking arrives — website / marketplace / walk-in (Bookings list)' },
  story2:         { src: '/media/story2.mp4', w: 2560, h: 1440, note: 'Room assigned — Booking Calendar' },
  story3:         { src: '/media/story3.mp4', w: 2560, h: 1440, note: 'Check-in — guest + ID + payment' },
  story4:         { src: '/media/story4.mp4', w: 2560, h: 1440, note: 'Stay — restaurant order posted to the room bill' },
  story5:         { src: '/media/story5.mp4', w: 2560, h: 1440, note: 'Check-out → housekeeping task → report' },
  bentoCash:      { src: '/media/bentoCash.mp4', w: 1200, h: 750,  note: 'GIF: cashbox / payments of the day' },
  bentoStaff:     { src: '/media/bentoStaff.mp4', w: 1200, h: 750,  note: 'GIF: staff attendance & shifts' },
  bentoCalendar:  { src: '/media/bentoCalendar.mp4', w: 1600, h: 700,  note: 'GIF: drag a booking on the calendar' },
  bentoHousekeep: { src: '/media/bentoHousekeep.mp4', w: 800,  h: 700,  note: 'GIF: checkout → cleaning task appears' },
  bentoRestaurant:{ src: '/media/bentoRestaurant.mp4', w: 1200, h: 750,  note: 'GIF: POS order posted to room bill' },
  bentoWebsite:   { src: '/media/bentoWebsite.mp4', w: 2400, h: 800,  note: 'GIF: hotel website theme switch' },
  helpVideo1:     { w: 1280, h: 720,  note: 'Video: create a booking (1 min, Bangla)' },
  helpVideo2:     { w: 1280, h: 720,  note: 'Video: add rooms (1 min, Bangla)' },
  helpVideo3:     { w: 1280, h: 720,  note: 'Video: collect payment & checkout (1 min, Bangla)' },
} satisfies Record<string, Slot>

export type MediaId = keyof typeof media
