import type { L } from '../i18n/lang'
import { pick } from './content'

// Text overrides for page copy. Admin: Content → Pages & sections.
// A key not in the published map keeps the text written in the component.
const overrides: Record<string, L> = pick('copy', {})

export const copy = (key: string, fallback: L): L => overrides[key] ?? fallback

/** Section visibility. Admin can hide a section; default is shown. */
const hidden: string[] = pick('hiddenSections', [])
export const shown = (key: string) => !hidden.includes(key)
