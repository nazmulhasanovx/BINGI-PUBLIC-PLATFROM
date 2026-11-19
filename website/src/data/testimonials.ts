import type { L } from '../i18n/lang'

// Real quotes only, with the person's written permission. The home section stays hidden while this list is empty.
export type Testimonial = { quote: L; name: string; role: L; property: string; photo?: string }
export const testimonials: Testimonial[] = []

// Property logos shown under the hero — only properties that agreed to be named. Empty = the logo row is hidden.
export type ClientLogo = { name: string; src: string }
export const clientLogos: ClientLogo[] = []
