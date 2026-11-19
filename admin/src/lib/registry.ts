// Types of packages/content/types.json (the one definition of every content type).
import type { L } from './i18n'
import registryJson from '../../../packages/content/types.json'

export type FieldType = 'string' | 'text' | 'l' | 'lt' | 'number' | 'bool' | 'enum' | 'url' | 'image' | 'date' | 'llist' | 'strlist' | 'list' | 'object' | 'blocks' | 'json'
export type FieldDef = { name: string; type: FieldType; required?: boolean; options?: string[]; fields?: FieldDef[]; internal?: boolean; help?: L }
export type TypeDef = {
  type: string; kind: 'single' | 'collection'; key: string; module: string; label: L; titleField?: string
  fields: FieldDef[]; guards?: string[]; shape?: 'list' | 'map' | 'values'; spread?: boolean
  count?: number; unpublished?: number
}
export const registry = registryJson as unknown as { version: number; types: TypeDef[] }
export const typeDef = (type: string) => registry.types.find((t) => t.type === type)!

export type Entry = { id: number; type: string; data: Record<string, unknown>; visible: boolean; sort: number; state: 'draft' | 'changed' | 'published'; updated_at: string }

/** A readable title for a list row. */
export function entryTitle(t: TypeDef, data: Record<string, unknown>, tr: (l: L | string) => string): string {
  const v = t.titleField ? data[t.titleField] : undefined
  if (v && typeof v === 'object' && 'en' in (v as L)) return tr(v as L)
  if (typeof v === 'string') return v
  return tr(t.label)
}

/** An empty value for a field (used for "Add"). */
export function emptyValue(f: FieldDef): unknown {
  switch (f.type) {
    case 'l': case 'lt': return { bn: '', en: '' }
    case 'bool': return false
    case 'number': return ''
    case 'llist': case 'strlist': case 'list': case 'blocks': return []
    case 'object': return Object.fromEntries((f.fields ?? []).map((x) => [x.name, emptyValue(x)]))
    case 'enum': return f.options?.[0] ?? ''
    case 'json': return null
    default: return ''
  }
}
export const emptyData = (t: TypeDef) => Object.fromEntries(t.fields.map((f) => [f.name, emptyValue(f)]))
