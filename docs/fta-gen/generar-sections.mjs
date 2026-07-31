/**
 * Genera src/data/sections.ts desde contenido-hito1.json.
 *
 *   node docs/fta-gen/generar-sections.mjs
 *
 * El JSON es una transcripción fiel del Excel; todo el criterio (qué tipo de campo
 * es cada pregunta, cómo se numeran, qué condicional aplica) vive acá, explícito y
 * revisable, en vez de repartido a mano por 112 objetos.
 *
 * Numeración: se renumera cada dimensión por posición → `D.N` (4.1 … 4.35). El Excel
 * mezcla dos criterios (ver consulta 5), y renumerar por posición es lo único que
 * hace consistentes todas las referencias cruzadas salvo dos, que quedan marcadas
 * con TODO (consultas 6 y 6 bis).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(AQUI, '../..')
const datos = JSON.parse(readFileSync(resolve(AQUI, 'contenido-hito1.json'), 'utf8'))

/* ── Dimensiones: slug y título definitivo ────────────────────────── */
const DIMS = [
  ['vision-general', 'Visión general'],
  ['detalles-modelo', 'Detalles del modelo'],
  ['clasificacion', 'Clasificación'],
  ['legal', 'Legal'],
  ['ciberseguridad', 'Ciberseguridad'],
  ['propiedad-intelectual', 'Propiedad intelectual'],
  ['consideraciones-eticas', 'Consideraciones éticas'],
  ['metricas', 'Métricas de rendimiento'],
  ['datos-entrenamiento', 'Datos de entrenamiento'],
  ['datos-evaluacion', 'Datos de evaluación'],
  ['advertencias', 'Advertencias y recomendaciones'],
  ['reclamacion', 'Reclamación'],
]

/* ── Criterio de tipo de campo, por número de pregunta (D.N) ───────
   Sólo se listan las excepciones: por defecto es textarea, salvo que la
   pregunta traiga opciones sí/no (radio) o alternativas (select/multiselect). */
const TIPO = {
  '1.1': 'text',    // Nombre del SDA
  '1.2': 'text',    // Nombre de la organización responsable
  '1.12': 'text',   // Recursos para más información (enlace)
  '2.1': 'text',    // Versión
  '2.2': 'text',    // Fecha de implementación
  '2.4': 'text',    // Tipo de licencia
  '2.5': 'text',    // Link del código
  '3.1': 'radio',   // ¿Categoriza o elabora perfiles?  (el Excel no trae fila Option)
  '4.28': 'radio',  // Momento de la revisión: dos opciones cortas
}

/** Alternativas de selección múltiple; el resto de las listas son de una sola. */
const MULTISELECT = new Set(['4.8', '4.12', '4.35'])

/* ── Condicionales ─────────────────────────────────────────────────
   `[numero de la pregunta que la gobierna, operador, valor]`.
   Las que el documento no explicita pero la herramienta ya aplicaba hoy van
   marcadas con `heredada`. */
const CONDICIONES = {
  // Clasificación: el documento no las repite, pero hoy ya cuelgan de la primera.
  '3.2': ['3.1', 'equals', 'Sí', 'heredada'],
  '3.3': ['3.1', 'equals', 'Sí', 'heredada'],
  '3.4': ['3.1', 'equals', 'Sí', 'heredada'],
  '3.5': ['3.1', 'equals', 'Sí', 'heredada'],
  '3.6': ['3.1', 'equals', 'Sí', 'heredada'],
  '3.7': ['3.1', 'equals', 'Sí', 'heredada'],

  // Legal
  '4.2': ['4.1', 'equals', 'Sí'],
  '4.5': ['4.4', 'equals', 'Sí'],
  '4.6': ['4.4', 'equals', 'Sí'],
  '4.7': ['4.4', 'equals', 'Sí'],
  '4.8': ['4.7', 'equals', 'No', 'consulta-6bis'],   // el Excel dice 4.6
  '4.9': [['4.6', 'equals', 'Sí'], ['4.8', 'includes', 'F']],
  '4.11': ['4.10', 'equals', 'Sí'],
  '4.12': ['4.10', 'equals', 'Sí'],
  '4.13': ['4.12', 'includes', 'A'],
  '4.14': ['4.13', 'equals', 'Sí'],
  '4.15': ['4.12', 'includes', 'B'],
  '4.16': ['4.12', 'includes', 'C'],
  '4.18': ['4.17', 'startsWith', 'A'],
  '4.19': ['4.17', 'startsWith', 'A'],
  '4.20': ['4.19', 'equals', 'Sí'],
  '4.21': ['4.17', 'startsWith', 'A'],
  '4.22': ['4.17', 'startsWith', 'A'],
  '4.23': ['4.17', 'startsWith', 'C'],
  '4.24': ['4.10', 'equals', 'Sí'],
  '4.27': ['4.26', 'equals', 'Sí'],
  '4.28': ['4.26', 'equals', 'Sí'],
  '4.29': ['4.26', 'equals', 'Sí'],
  '4.31': ['4.30', 'equals', 'Sí'],
  '4.33': ['4.32', 'equals', 'Sí', 'consulta-6'],    // el Excel dice 4.35

  // Ciberseguridad: 5.2 cuelga de 5.1, y de 5.2 cuelga el resto de la dimensión.
  '5.2': ['5.1', 'equals', 'Sí'],

  // Reclamación
  '12.2': ['12.1', 'equals', 'Sí', 'heredada'],
  '12.4': ['12.3', 'equals', 'Sí'],
  '12.5': ['12.3', 'equals', 'Sí'],
}
// 5.3 … 5.21 cuelgan todas de 5.2 (consulta 1).
for (let i = 3; i <= 21; i++) CONDICIONES[`5.${i}`] = ['5.2', 'equals', 'Sí', 'consulta-1']

/* ── Utilidades ────────────────────────────────────────────────────── */
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')

/** Normaliza espacios y saltos sobrantes de las celdas de Excel. */
const limpiar = s => String(s || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()

/**
 * Parte una lista de alternativas. El documento usa dos formatos: items
 * rotulados con letra ("A. …") separados por saltos, o una línea con ";".
 */
function parseAlternativas(txt) {
  let t = limpiar(txt)
  if (!t) return []
  if (/(^|\n)\s*[A-Z]\.\s/.test(t)) {
    // Algunas listas van en una sola línea separadas por ";": se normalizan a saltos.
    t = t.replace(/;\s*(?=[A-Z]\.\s)/g, '\n')
    return t.split(/\n(?=\s*[A-Z]\.\s)/)
      .map(s => limpiar(s).replace(/\n+/g, ' '))
      .filter(Boolean)
  }
  if (t.includes(';')) return t.split(';').map(s => limpiar(s)).filter(Boolean)
  return [t]
}

/* ── Construcción ──────────────────────────────────────────────────── */
const secciones = []
const avisos = []

/**
 * Preguntas que otra condición evalúa contra "Sí"/"No". Varias de ellas no traen
 * fila `Option` en el Excel y quedarían como texto libre, lo que rompería la
 * condicional: nadie escribe exactamente "Sí" en un campo abierto.
 */
const SI_NO_POR_CONDICION = new Set()
for (const regla of Object.values(CONDICIONES)) {
  if (!regla) continue
  for (const [ref, op, val] of (Array.isArray(regla[0]) ? regla : [regla])) {
    if (op === 'equals' && /^(s[ií]|no)$/i.test(val)) SI_NO_POR_CONDICION.add(ref)
  }
}

datos.dimensiones.forEach((dim, di) => {
  const nDim = di + 1
  const [slug, title] = DIMS[di]
  const preguntas = []

  dim.preguntas.forEach((q, qi) => {
    const numero = `${nDim}.${qi + 1}`
    const id = `d${String(nDim).padStart(2, '0')}_q${String(qi + 1).padStart(2, '0')}`
    const texto = limpiar(q.texto)

    // Tipo
    let tipo = TIPO[numero]
    let options
    const alternativas = parseAlternativas(q.alternativas)

    if (!tipo && /s[ií]\s*\/\s*no/i.test(q.opciones || '')) {
      tipo = 'radio'
      options = ['Sí', 'No']
    } else if (!tipo && alternativas.length > 1) {
      tipo = MULTISELECT.has(numero) ? 'multiselect' : 'select'
      options = alternativas
    } else if (tipo === 'radio' && !options) {
      options = alternativas.length > 1 ? alternativas : ['Sí', 'No']
    }
    if (!tipo && SI_NO_POR_CONDICION.has(numero)) {
      tipo = 'radio'
      options = ['Sí', 'No']
      avisos.push(`${numero}: sin fila Option en el Excel, se asume sí/no porque otra pregunta la evalúa así`)
    }
    if (!tipo) tipo = 'textarea'
    if ((tipo === 'select' || tipo === 'multiselect') && !options) options = alternativas

    // Obligatoriedad y marca de IA generativa
    const cond = (q.obligatoria || '').trim()
    const iaGen = /iagen/i.test(cond) || /iagen/i.test(q.comentario || '')
    const isRequired = /^\(\*\)/.test(cond) || /^obligatoria/i.test(cond)

    // Condicional
    const regla = CONDICIONES[numero]
    let dependsOn, nota
    if (regla) {
      const reglas = Array.isArray(regla[0]) ? regla : [regla]
      dependsOn = reglas.map(([ref, op, val]) => {
        const refId = `d${String(nDim).padStart(2, '0')}_q${String(Number(ref.split('.')[1])).padStart(2, '0')}`
        if (op === 'includes' || op === 'startsWith') {
          // La condición apunta a la alternativa que empieza con esa letra.
          return { questionId: refId, [op === 'includes' ? 'includes' : 'equals']: `__LETRA_${val}__${ref}` }
        }
        return { questionId: refId, equals: val }
      })
      const marca = reglas.find(r => r[3])?.[3]
      if (marca && marca !== 'heredada') nota = marca
      if (marca === 'heredada') nota = 'heredada'
    }

    if (!q.tooltip) avisos.push(`${numero} sin tooltip`)

    preguntas.push({
      id, numero, texto, tipo, options,
      isRequired, iaGen,
      tooltip: limpiar(q.tooltip),
      placeholder: limpiar(q.placeholder),
      bloque: limpiar(q.bloque),
      dependsOn, nota,
    })
  })

  secciones.push({ slug, title, preguntas })
})

/* Resuelve los marcadores `__LETRA_X__ref` a la alternativa concreta. */
const porNumero = new Map()
secciones.forEach((s, di) => s.preguntas.forEach(p => porNumero.set(`${di + 1}.${p.numero.split('.')[1]}`, p)))
for (const s of secciones) {
  for (const p of s.preguntas) {
    if (!p.dependsOn) continue
    for (const c of p.dependsOn) {
      for (const k of ['includes', 'equals']) {
        const v = c[k]
        if (typeof v === 'string' && v.startsWith('__LETRA_')) {
          const [, letra, ref] = v.match(/^__LETRA_(\w)__(.+)$/)
          const destino = porNumero.get(ref)
          const coincidencias = (destino?.options || []).filter(o => o.trim().toUpperCase().startsWith(letra + '.'))
          if (!coincidencias.length) {
            avisos.push(`${p.numero}: no se encontró la alternativa "${letra}" en ${ref}`)
            c[k] = letra
          } else {
            // Letra repetida en la lista de origen: la condición sólo puede
            // apuntar a una, y no hay forma de saber a cuál (consulta 8).
            if (coincidencias.length > 1) {
              p.nota = 'consulta-8'
              avisos.push(`${p.numero}: la alternativa "${letra}" está repetida ${coincidencias.length} veces en ${ref}`)
            }
            c[k] = coincidencias[0]
          }
        }
      }
    }
  }
}

/* ── Emisión ───────────────────────────────────────────────────────── */
const L = []
L.push(`/**`)
L.push(` * Cuestionario de la ficha de transparencia — FTA Gen · Hito 1.`)
L.push(` *`)
L.push(` * GENERADO por docs/fta-gen/generar-sections.mjs desde contenido-hito1.json,`)
L.push(` * que es la transcripción del documento del Drive. Se puede editar a mano, pero`)
L.push(` * si el contenido cambia en el Drive conviene volver a generar y reaplicar.`)
L.push(` *`)
L.push(` * Los TODO(consulta-N) apuntan a docs/fta-gen/consultas-equipo.md.`)
L.push(` */`)
L.push(`import type { Section } from './question-types'`)
L.push(``)
L.push(`export * from './question-types'`)
L.push(``)
L.push(`export const sections: Section[] = [`)

for (const s of secciones) {
  L.push(`  {`)
  L.push(`    id: '${esc(s.slug)}',`)
  L.push(`    title: '${esc(s.title)}',`)
  L.push(`    questions: [`)
  let bloqueActual = null
  for (const p of s.preguntas) {
    if (p.bloque && p.bloque !== bloqueActual) {
      bloqueActual = p.bloque
      L.push(``)
      L.push(`      /* ── ${p.bloque} ── */`)
    }
    L.push(`      {`)
    L.push(`        id: '${p.id}',`)
    L.push(`        numero: '${p.numero}',`)
    L.push(`        text: '${esc(p.texto)}',`)
    L.push(`        type: '${p.tipo}',`)
    if (p.options?.length) {
      L.push(`        options: [`)
      for (const o of p.options) L.push(`          '${esc(o)}',`)
      L.push(`        ],`)
    }
    L.push(`        isRequired: ${p.isRequired},`)
    L.push(`        tooltip: '${esc(p.tooltip)}',`)
    if (p.placeholder) L.push(`        placeholder: '${esc(p.placeholder)}',`)
    if (p.bloque) L.push(`        bloque: '${esc(p.bloque)}',`)
    if (p.iaGen) L.push(`        iaGen: true,`)
    if (p.dependsOn) {
      if (p.nota && p.nota !== 'heredada') L.push(`        // TODO(${p.nota}): revisar esta condición con el equipo de contenido.`)
      if (p.nota === 'heredada') L.push(`        // Condición heredada de la v4: el documento del Hito 1 no la explicita.`)
      L.push(`        dependsOn: [`)
      for (const c of p.dependsOn) {
        const k = c.includes !== undefined ? 'includes' : 'equals'
        L.push(`          { questionId: '${c.questionId}', ${k}: '${esc(c[k])}' },`)
      }
      L.push(`        ],`)
    }
    L.push(`      },`)
  }
  L.push(`    ],`)
  L.push(`  },`)
}
L.push(`]`)
L.push(``)

writeFileSync(resolve(RAIZ, 'src/data/sections.ts'), L.join('\n'))

/* Los ids que el sidebar y el encabezado del PDF referencian directamente. Si el
   contenido se reordena y dejan de existir, el campo queda vacío sin fallar —
   ya pasó con `nombreModelo1` de la v4 — así que se avisa acá. */
const idsGenerados = new Set(secciones.flatMap(s => s.preguntas.map(p => p.id)))
const clave = readFileSync(resolve(RAIZ, 'src/data/question-types.ts'), 'utf8')
const bloqueClave = (clave.match(/PREGUNTAS_CLAVE = \{([\s\S]*?)\}/) || [])[1] || ''
for (const [, campo, id] of bloqueClave.matchAll(/(\w+):\s*'([^']+)'/g)) {
  if (!idsGenerados.has(id)) {
    avisos.push(`PREGUNTAS_CLAVE.${campo} apunta a '${id}', que ya no existe — actualizar question-types.ts`)
  }
}

const total = secciones.reduce((n, s) => n + s.preguntas.length, 0)
console.log(`sections.ts generado · ${secciones.length} dimensiones · ${total} preguntas`)
const tipos = {}
for (const s of secciones) for (const p of s.preguntas) tipos[p.tipo] = (tipos[p.tipo] || 0) + 1
console.log('tipos:', tipos)
console.log(`condicionales: ${secciones.reduce((n, s) => n + s.preguntas.filter(p => p.dependsOn).length, 0)}`)
if (avisos.length) console.log(`\navisos (${avisos.length}):\n  ` + avisos.join('\n  '))
