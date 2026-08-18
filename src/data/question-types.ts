/**
 * Modelo del cuestionario y reglas de visibilidad.
 *
 * Vive aparte de `sections.ts` porque ese archivo se genera desde el Excel del
 * Hito 1 (ver docs/fta-gen/) y se puede volver a generar; esto no.
 *
 * El cuestionario y el PDF comparten `shouldShow`, `isAnswered` y `forContexto`
 * a propósito: si cada uno decidiera por su cuenta qué pregunta aplica y con qué
 * redacción, el documento terminaría mostrando respuestas de preguntas ocultas,
 * o el enunciado del contexto equivocado.
 */

import { CONTEXTO_DEFAULT, type Contexto } from '@/lib/contexto'

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
  /**
   * Contexto normativo exclusivo. Si se define, la pregunta no aparece en el
   * otro contexto. Sin definir, aplica a ambos.
   */
  soloContexto?: Contexto
  /**
   * Reescrituras por contexto. Lo que no se define hereda el valor base.
   *
   * Hoy lo usan cuatro preguntas de Legal y Ciberseguridad que citan normativa
   * chilena (la Ley Marco, la ANCI, las causales por letra) y que en el contexto
   * internacional se enuncian de forma neutra.
   */
  overrides?: Partial<Record<Contexto, {
    text?: string
    tooltip?: string
    options?: string[]
    placeholder?: string
  }>>
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

/**
 * Preguntas que identifican al SDA fuera del cuestionario: el encabezado del
 * cuestionario y el del documento.
 *
 * Están acá y no repetidas en cada componente porque los identificadores cambian
 * cuando se regenera `sections.ts`, y una referencia obsoleta no falla: el campo
 * simplemente queda vacío. Ya pasó una vez — el sidebar siguió apuntando a
 * `nombreModelo1` de la v4 y mostraba "Sistema sin nombre" con la ficha llena.
 *
 * `generar-sections.mjs` verifica que estos ids existan al regenerar.
 */
export const PREGUNTAS_CLAVE = {
  nombre: 'd01_q01',        // 1.1 Nombre del SDA
  organizacion: 'd01_q02',  // 1.2 Nombre de la organización responsable del SDA
  version: 'd02_q01',       // 2.1 ¿En qué versión se encuentra el SDA?
} as const

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

/**
 * Aplica las reescrituras del contexto activo. Devuelve la pregunta tal cual si
 * no tiene overrides, así que es barato llamarla siempre.
 */
export function forContexto(question: Question, contexto: Contexto = CONTEXTO_DEFAULT): Question {
  const o = question.overrides?.[contexto]
  return o ? { ...question, ...o } : question
}

/**
 * Índice id → pregunta de una dimensión, memoizado.
 *
 * Alcanza con un índice por sección porque **todas las dependencias del
 * cuestionario son intra-dimensión**; `generar-sections.mjs` avisa si alguna
 * llegara a cruzar. Un índice global obligaría a importar `sections.ts` desde
 * acá, y `sections.ts` ya reexporta este módulo: sería un ciclo.
 */
const indicePorSeccion = new WeakMap<Section, Map<string, Question>>()

function indiceDe(section: Section): Map<string, Question> {
  let idx = indicePorSeccion.get(section)
  if (!idx) {
    idx = new Map(section.questions.map(q => [q.id, q]))
    indicePorSeccion.set(section, idx)
  }
  return idx
}

/**
 * ¿Esta pregunta aplica?
 *
 * La condición se evalúa **de forma transitiva**: no basta con que el padre
 * tenga el valor esperado, el padre además tiene que estar visible. Las
 * respuestas nunca se purgan —a propósito, para que revertir un cambio no
 * borre lo ya escrito— así que sin esta comprobación una respuesta huérfana
 * mantiene viva toda su rama. En Ciberseguridad son 19 obligatorias colgando
 * de una sola pregunta: bastaba corregir `5.1` a "No" para quedar con la
 * descarga bloqueada por preguntas que ya no se muestran.
 *
 * `contexto` es obligatorio a propósito: si tuviera valor por defecto, un
 * componente que olvidara pasarlo mostraría el contenido chileno sin fallar.
 *
 * `index` es opcional para no romper llamadas sueltas; sin él se comporta como
 * antes (un solo nivel). `visibleQuestions` siempre lo pasa.
 */
export function shouldShow(
  question: Question,
  answers: Answers,
  contexto: Contexto,
  index?: Map<string, Question>,
  seen: Set<string> = new Set(),
): boolean {
  if (question.soloContexto && question.soloContexto !== contexto) return false
  if (question.iaGen && IA_GEN_QUESTION_ID) {
    if (answers[IA_GEN_QUESTION_ID] !== 'Sí') return false
  }
  if (!question.dependsOn?.length) return true

  // Corte de ciclos. Ante un ciclo en el contenido preferimos mostrar de más:
  // ocultar preguntas en silencio por un error de datos es mucho peor.
  if (seen.has(question.id)) return true
  const visto = new Set(seen).add(question.id)

  return question.dependsOn.every(c => {
    const padre = index?.get(c.questionId)
    if (padre && !shouldShow(padre, answers, contexto, index, visto)) return false
    return meets(c, answers)
  })
}

/**
 * Preguntas de la dimensión que aplican con las respuestas y el contexto
 * actuales, ya con la redacción del contexto resuelta.
 */
export function visibleQuestions(section: Section, answers: Answers, contexto: Contexto): Question[] {
  const index = indiceDe(section)
  return section.questions
    .filter(q => shouldShow(q, answers, contexto, index))
    .map(q => forContexto(q, contexto))
}

/** Porcentaje 0–100 de preguntas visibles respondidas. */
export function sectionProgress(section: Section, answers: Answers, contexto: Contexto): number {
  const visibles = visibleQuestions(section, answers, contexto)
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
export function isSectionComplete(section: Section, answers: Answers, contexto: Contexto): boolean {
  const visibles = visibleQuestions(section, answers, contexto)
  if (!visibles.length) return false
  if (!visibles.some(q => isAnswered(q, answers))) return false
  return visibles.every(q => !q.isRequired || isAnswered(q, answers))
}
