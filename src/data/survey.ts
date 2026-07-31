/**
 * Encuesta de satisfacción de la Ficha de Transparencia.
 *
 * Enunciados de la hoja «Encuesta facilidad de uso» del documento FTA Gen · Hito 1
 * (ver docs/fta-gen/contenido-hito1.json). Es casi la misma encuesta que la EIA,
 * con dos diferencias:
 *
 *   · P1 es nueva — nombre de la institución. Necesita la columna `p1_institucion`
 *     en `tool_survey`; ver supabase/migrations/002_survey_institucion.sql.
 *   · P7 cambia de tema: en la EIA pregunta por las recomendaciones, aquí por el
 *     PDF generado. La columna sigue llamándose `p7_recomendaciones` para no
 *     romper los reportes que ya cruzan ambas herramientas.
 *
 * Los `id` NO son libres: la API los mapea a columnas fijas de `tool_survey`
 * (ver src/app/api/survey/route.ts). Agregar o quitar preguntas obliga a tocar
 * también ese mapeo y la migración.
 */

export type SurveyKind = 'scale' | 'yesno' | 'yesno_text' | 'text' | 'short_text' | 'yesno_contact'

export type SurveyItem = {
  id: string
  kind: SurveyKind
  pregunta: string
  tooltip?: string
  min?: string
  max?: string
  placeholder?: string
  /** Bloquea el envío si queda sin responder. */
  requerida?: boolean
}

export const SURVEY: SurveyItem[] = [
  {
    id: "1",
    kind: "short_text",
    pregunta: "Nombre de la institución pública a la que pertenece o representa",
    placeholder: "Ej.: Servicio de Salud Metropolitano Sur",
    requerida: true,
  },
  {
    id: "2",
    kind: "scale",
    pregunta: "En general, ¿qué tan fácil le resultó usar esta herramienta?",
    tooltip: "Evalúe su experiencia global con la plataforma: qué tan intuitiva fue la navegación, si entendió qué se esperaba en cada paso y si pudo completar la ficha sin mayor dificultad.",
    min: "Muy difícil de usar",
    max: "Muy fácil de usar",
  },
  {
    id: "3",
    kind: "scale",
    pregunta: "¿En qué medida la herramienta le indicó claramente qué debía hacer en cada etapa de la ficha?",
    tooltip: "Evalúe si la plataforma le orientó en cada paso: si las instrucciones eran claras, si supo cómo avanzar y qué se esperaba de usted antes de pasar a la siguiente sección.",
    min: "Nunca supe qué se esperaba de mí",
    max: "Siempre tuve claro qué hacer",
  },
  {
    id: "4",
    kind: "scale",
    pregunta: "¿En qué medida la herramienta facilitó la participación de personas con distintos perfiles (técnicos y no técnicos) dentro de su equipo?",
    tooltip: "Considere si la herramienta permitió que tanto perfiles técnicos (analistas, informáticos) como no técnicos (jefes de servicio, profesionales de gestión) pudieran participar del desarrollo de la ficha.",
    min: "No facilitó la participación en absoluto",
    max: "Facilitó muy bien la colaboración",
  },
  {
    id: "5",
    kind: "scale",
    pregunta: "¿En qué medida las preguntas de la herramienta son adecuadas para la elaboración de una ficha de transparencia de un proyecto de IA o ciencia de datos en el contexto de su institución?",
    tooltip: "Evalúe si las preguntas abordaron los temas correctos (problema institucional, datos disponibles, ética, etc.) y si le resultaron útiles para pensar en su proyecto específico. ¿Sintió que la herramienta le preguntó lo que realmente importaba?",
    min: "Muy inadecuadas",
    max: "Muy adecuadas",
  },
  {
    id: "6",
    kind: "scale",
    pregunta: "¿Qué tan claro y comprensible le resultó el lenguaje utilizado en las preguntas de la herramienta?",
    tooltip: "Evalúe si las preguntas y sus descripciones estaban escritas en un lenguaje accesible para equipos mixtos (técnicos y no técnicos). ¿Necesitó buscar definiciones o pedir ayuda para entender qué se preguntaba?",
    min: "Muy confuso o técnico",
    max: "Muy claro y comprensible",
  },
  {
    id: "7",
    kind: "scale",
    pregunta: "Al finalizar la formulación, ¿en qué medida sintió que el documento PDF generado representa fielmente su proyecto?",
    tooltip: "Evalúe si el documento final recoge con precisión y claridad las respuestas e ideas que su equipo ingresó. ¿Lo usaría para presentar el proyecto dentro de su institución?",
    min: "El PDF no refleja lo que formulamos",
    max: "El PDF representa muy bien nuestro proyecto",
  },
  {
    id: "8",
    kind: "yesno",
    pregunta: "¿Recomendaría esta herramienta a otros equipos de servicios públicos que estén trabajando con proyectos de IA o ciencia de datos?",
    tooltip: "Considere si la herramienta le aportó valor real en el proceso de formulación: ¿estructuró mejor el proyecto?, ¿facilitó el trabajo del equipo?, ¿lo usaría de nuevo?",
  },
  {
    id: "9",
    kind: "yesno_text",
    pregunta: "¿Considera que hay algún tema o pregunta importante que la herramienta no abordó?",
    tooltip: "Piense en los aspectos de su proyecto que no encontraron espacio en ninguna sección de la herramienta. ¿Hubo algo relevante que no pudo documentar?",
    placeholder: "Describa brevemente el tema o pregunta que faltó (ej.: \"No había espacio para describir el presupuesto estimado del proyecto\").",
  },
  {
    id: "10",
    kind: "text",
    pregunta: "Si desea agregar algún comentario, sugerencia o crítica sobre la herramienta, puede hacerlo aquí.",
    placeholder: "Este espacio es libre. Puede comentar sobre aspectos positivos, dificultades que encontró, ideas para mejorar la plataforma, o cualquier otra observación que no haya podido expresar en las preguntas anteriores.",
  },
  {
    id: "11",
    kind: "yesno_contact",
    pregunta: "¿Le interesa recibir información sobre servicios de acompañamiento para la revisión ética y técnica de su proyecto?",
    tooltip: "GobLab UAI ofrece servicios de consultoría para apoyar la mitigación de riesgos éticos en proyectos de IA en el sector público. Si marca \"Sí\", un profesional del equipo se pondrá en contacto con usted.",
  },
]
