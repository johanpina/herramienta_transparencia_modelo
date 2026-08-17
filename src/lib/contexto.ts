/**
 * Contexto normativo de la ficha.
 *
 * La ficha nace ajustada a la normativa chilena: hay preguntas que citan la Ley
 * Marco de Ciberseguridad, la ANCI o las causales de la ley de datos personales.
 * Para trabajar con instituciones de otros países se agrega un segundo contexto,
 * donde esas referencias se reemplazan por su equivalente neutro ("la normativa
 * de ciberseguridad vigente en su país", "la autoridad nacional competente").
 *
 * Mismo modelo que la Evaluación de Impacto Algorítmico (ver su
 * `src/lib/contexto.ts`), para que ambas herramientas se comporten igual.
 *
 * El contenido diferenciado vive en `overrides` dentro de cada pregunta; ver
 * src/data/question-types.ts.
 */

export type Contexto = 'chile' | 'internacional'

export const CONTEXTO_DEFAULT: Contexto = 'chile'

export const CONTEXTOS: Array<{ id: Contexto; label: string; short: string; icon: string }> = [
  { id: 'chile', label: 'Contexto chileno', short: 'Chile', icon: '🇨🇱' },
  { id: 'internacional', label: 'Contexto internacional', short: 'Internacional', icon: '🌐' },
]

export function esContexto(v: unknown): v is Contexto {
  return v === 'chile' || v === 'internacional'
}

/** Un valor ausente o inválido cae al contexto por defecto, nunca falla. */
export function normalizarContexto(v: unknown): Contexto {
  return esContexto(v) ? v : CONTEXTO_DEFAULT
}

export function labelContexto(c: Contexto): string {
  return CONTEXTOS.find(x => x.id === c)?.label ?? c
}

export function iconoContexto(c: Contexto): string {
  return CONTEXTOS.find(x => x.id === c)?.icon ?? ''
}

/** Clave de localStorage: el contexto debe sobrevivir a un refresco. */
export const CONTEXTO_STORAGE_KEY = 'contextoFicha'
