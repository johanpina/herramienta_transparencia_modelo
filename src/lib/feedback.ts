/**
 * Envío de feedback con contexto (mismo contrato que la EIA, para que ambas
 * herramientas escriban filas comparables en `tool_feedback`).
 *
 * El contexto viaja dos veces a propósito: incrustado como primera línea de
 * `description`, para que la fila se lea sola en el panel de Supabase, y como
 * objeto, para que la API lo guarde en columnas consultables.
 */

export type FeedbackContext = {
  /** 'portada' | 'cuestionario' | 'vista previa' */
  pantalla?: string
  /** Ej. '03 Categorización o elaboración de perfiles' */
  seccion?: string
  /** Numeración visible, ej. '3.2' */
  pregunta?: string
  /** Id interno, ej. 'classModeloTA15' */
  questionId?: string
  /** Porcentaje 0–100 */
  progreso?: number
}

/** Categorías que ya acepta la tabla. La UI puede rotularlas distinto. */
export const FEEDBACK_TYPES = {
  comentario: 'Comentario general',
  error: 'Reporte de error',
  sugerencia: 'Sugerencia de mejora',
  pregunta: 'Pregunta',
  otro: 'Otro',
} as const

/**
 * Antepone una línea de contexto al texto. Omite las claves ausentes y
 * devuelve el texto tal cual si no hay nada que anteponer.
 */
export function buildDescription(text: string, ctx?: FeedbackContext): string {
  if (!ctx) return text

  const parts: string[] = []
  if (ctx.pantalla) parts.push(`pantalla: ${ctx.pantalla}`)
  if (ctx.seccion) parts.push(`sección: ${ctx.seccion}`)
  if (ctx.pregunta) {
    parts.push(`pregunta: ${ctx.pregunta}${ctx.questionId ? ` (${ctx.questionId})` : ''}`)
  } else if (ctx.questionId) {
    parts.push(`pregunta: ${ctx.questionId}`)
  }
  if (typeof ctx.progreso === 'number') parts.push(`progreso: ${Math.round(ctx.progreso)}%`)

  if (!parts.length) return text
  return `[${parts.join(' · ')}]\n${text}`
}

/**
 * Publica el feedback. Lanza si la API responde error, para que cada
 * llamador decida cómo avisar (toast, estado inline, etc.).
 */
export async function sendFeedback(opts: {
  category: string
  text: string
  email?: string
  organization?: string
  context?: FeedbackContext
}): Promise<void> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feedback_type: opts.category,
      description: buildDescription(opts.text, opts.context),
      email: opts.email || 'anonimo@goblab.cl',
      organization: opts.organization || '',
      context: opts.context ?? null,
    }),
  })

  const data = await res.json().catch(() => ({ success: false, error: 'Respuesta inválida' }))
  if (!data.success) throw new Error(data.error || 'No se pudo enviar el feedback')
}

/**
 * Envía la encuesta de satisfacción a `tool_survey`, con una columna por
 * pregunta. `texto` es la versión legible que la API usa como respaldo si la
 * tabla todavía no existe.
 */
export async function sendSurvey(opts: {
  respuestas: Record<string, string>
  texto: string
  email?: string
  progreso?: number
}): Promise<void> {
  const res = await fetch('/api/survey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      respuestas: opts.respuestas,
      texto: opts.texto,
      email: opts.email || null,
      progreso: opts.progreso,
    }),
  })

  const data = await res.json().catch(() => ({ success: false, error: 'Respuesta inválida' }))
  if (!data.success) throw new Error(data.error || 'No se pudo enviar la encuesta')
}
