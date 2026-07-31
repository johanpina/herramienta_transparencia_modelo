/**
 * Modelo del cuestionario y reglas de visibilidad.
 *
 * Vive aparte de `sections.ts` porque ese archivo se genera desde el Excel del
 * Hito 1 (ver docs/fta-gen/) y se puede volver a generar; esto no.
 *
 * El cuestionario y el PDF comparten `shouldShow` / `isAnswered` a propósito: si
 * cada uno decidiera por su cuenta qué pregunta aplica, el documento terminaría
 * mostrando respuestas de preguntas ocultas, o perdiendo las visibles.
 */

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'radio'        // pocas opciones cortas, en línea
  | 'select'       // una opción entre alternativas largas
  | 'multiselect'  // varias alternativas a la vez
  | 'slider'
  | 'date'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type Answers = Record<string, any>

/**
 * Una condición sobre otra pregunta. Se indica exactamente uno de los tres
 * operadores.
 */
export interface Condition {
  questionId: string
  /** Igualdad exacta — radio y select. */
  equals?: string | number
  /** El valor está entre los marcados — multiselect. */
  includes?: string
  /** Umbral — slider. */
  atLeast?: number
}

export interface Question {
  id: string
  /** Numeración visible dentro de la dimensión, ej. "4.12". */
  numero: string
  text: string
  type: QuestionType
  options?: string[]
  isRequired: boolean
  tooltip: string
  placeholder?: string
  /** Subtítulo que agrupa preguntas dentro de una dimensión (lo usa Legal). */
  bloque?: string
  min?: number
  max?: number
  step?: number
  /** Se muestra sólo si se cumplen TODAS. */
  dependsOn?: Condition[]
  /** Sólo aplica si el SDA incorpora IA generativa (ver `IA_GEN_QUESTION_ID`). */
  iaGen?: boolean
}

export interface Section {
  id: string
  title: string
  questions: Question[]
}

/**
 * Pregunta que enciende el subconjunto de IA generativa. Mientras el equipo de
 * contenido no la defina (consulta 4), las preguntas con `iaGen` se muestran
 * siempre: es preferible una pregunta de más que una regulación no documentada.
 */
export const IA_GEN_QUESTION_ID: string | null = null

/** ¿La respuesta cuenta como dada? Un multiselect vacío no cuenta. */
export function isAnswered(question: Question, answers: Answers): boolean {
  const v = answers[question.id]
  if (v === undefined || v === null) return false
  if (Array.isArray(v)) return v.length > 0
  return String(v).length > 0
}

function meets(cond: Condition, answers: Answers): boolean {
  const v = answers[cond.questionId]
  if (cond.includes !== undefined) {
    return Array.isArray(v) && v.includes(cond.includes)
  }
  if (cond.atLeast !== undefined) {
    return typeof v === 'number' && v >= cond.atLeast
  }
  return v === cond.equals
}

export function shouldShow(question: Question, answers: Answers): boolean {
  if (question.iaGen && IA_GEN_QUESTION_ID) {
    if (answers[IA_GEN_QUESTION_ID] !== 'Sí') return false
  }
  if (!question.dependsOn?.length) return true
  return question.dependsOn.every(c => meets(c, answers))
}

/** Preguntas de la dimensión que aplican con las respuestas actuales. */
export function visibleQuestions(section: Section, answers: Answers): Question[] {
  return section.questions.filter(q => shouldShow(q, answers))
}

/** Porcentaje 0–100 de preguntas visibles respondidas. */
export function sectionProgress(section: Section, answers: Answers): number {
  const visibles = visibleQuestions(section, answers)
  if (!visibles.length) return 0
  return Math.round((visibles.filter(q => isAnswered(q, answers)).length / visibles.length) * 100)
}

/**
 * Una dimensión está completa cuando no le falta ninguna obligatoria visible.
 *
 * Se exige además al menos una respuesta: hay dimensiones sin preguntas
 * obligatorias (Consideraciones éticas, por ejemplo) y sin esta condición
 * aparecerían con el visto puesto desde antes de que el usuario las abra.
 */
export function isSectionComplete(section: Section, answers: Answers): boolean {
  const visibles = visibleQuestions(section, answers)
  if (!visibles.length) return false
  if (!visibles.some(q => isAnswered(q, answers))) return false
  return visibles.every(q => !q.isRequired || isAnswered(q, answers))
}
