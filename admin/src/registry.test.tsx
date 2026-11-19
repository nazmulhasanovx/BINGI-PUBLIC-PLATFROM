import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { registry, emptyData, typeDef } from '@/lib/registry'
import { allModules } from '@/lib/modules'
import { LangProvider } from '@/lib/i18n'
import { FieldInput } from '@/components/form/FieldInput'

describe('content registry ↔ admin modules', () => {
  it('every content type has a home in the sidebar', () => {
    const covered = new Set(allModules.flatMap((m) => m.types ?? []))
    const missing = registry.types.map((t) => t.type).filter((t) => !covered.has(t))
    expect(missing).toEqual([])
  })
  it('every module type exists in types.json', () => {
    for (const m of allModules) for (const t of m.types ?? []) expect(typeDef(t), `${m.id} → ${t}`).toBeTruthy()
  })
  it('builds an empty item with both languages for bilingual fields', () => {
    const d = emptyData(typeDef('team_member'))
    expect(d.role).toEqual({ bn: '', en: '' })
    expect(d.name).toBe('')
  })
})

describe('FieldInput', () => {
  it('shows a Bangla and an English box for a bilingual field, and the field error', () => {
    render(<LangProvider><FieldInput f={{ name: 'role', type: 'l', required: true }} value={{ bn: 'ক', en: 'A' }} onChange={() => {}} path="role" errors={{ role: 'Write both Bangla and English.' }} /></LangProvider>)
    expect(screen.getByDisplayValue('ক')).toBeTruthy()
    expect(screen.getByDisplayValue('A')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toBe('Write both Bangla and English.')
  })
})
