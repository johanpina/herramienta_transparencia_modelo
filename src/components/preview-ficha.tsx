'use client'

/**
 * Vista previa y documento imprimible de la ficha.
 *
 * Lo que se ve aquí es exactamente lo que sale en el PDF: PdfExportButton imprime
 * el nodo `#ficha-preview` con react-to-print. Por eso los estilos van inline con
 * los tokens "Civic Rose" (src/lib/civic.ts) y no con clases de Tailwind: el
 * diálogo de impresión conserva los estilos calculados del nodo.
 *
 * El contenido se recorre desde `sections`, no se mapea campo por campo. Con 112
 * preguntas el mapeo a mano es inmantenible, y fue justo lo que hizo que la v4
 * perdiera en silencio respuestas cuyos identificadores no coincidían.
 *
 * `print-color-adjust: exact` es imprescindible: sin él Chrome descarta los fondos
 * rosados y la ficha sale en blanco y negro.
 */

import React, { useState } from 'react'
import { format } from 'date-fns'
import { PdfExportButton } from '@/components/PdfExportButton'
import { T, SERIF, MONO } from '@/lib/civic'
import { I, LogoUAIGobLab } from '@/components/civic-icons'
import { sections, visibleQuestions, isAnswered, type Answers, type Question } from '@/data/sections'

interface PreviewFichaProps {
  formData: Answers
  onClose: () => void
  isPdfGeneration?: boolean
}

/** Ids de las preguntas que alimentan el encabezado del documento. */
const PORTADA = {
  nombre: 'd01_q01',   // 1.1 Nombre del SDA
  version: 'd02_q01',  // 2.1 ¿En qué versión se encuentra el SDA?
}

/** Respuesta de sí/no: se muestra como píldora para que se lea de un vistazo. */
function Pildora({ value }: { value: string }) {
  const si = /^s[ií]$/i.test(value.trim())
  return (
    <span style={{
      display: 'inline-block', minWidth: 26, textAlign: 'center', padding: '1px 8px',
      borderRadius: 99, fontSize: 9.5, fontWeight: 700, fontFamily: MONO,
      background: si ? T.rosePaper : T.paperDeep,
      color: si ? T.burgundy : T.ink60,
      border: `1px solid ${si ? T.roseLight : T.line}`,
      printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact',
    }}>{value}</span>
  )
}

/** Una pregunta con su respuesta. El enunciado hace de rótulo. */
function Dato({ question, value }: { question: Question; value: unknown }) {
  const esSiNo = question.type === 'radio'
    && question.options?.length === 2
    && question.options.every(o => /^(s[ií]|no)$/i.test(o))

  const cuerpo = Array.isArray(value)
    ? (
      // Multiselect: una línea por alternativa marcada.
      <ul style={{ margin: '3px 0 0', paddingLeft: 16 }}>
        {value.map((v, i) => (
          <li key={i} style={{ marginBottom: 2 }}>{String(v)}</li>
        ))}
      </ul>
    )
    : esSiNo
      ? <Pildora value={String(value)} />
      : <span>{String(value)}</span>

  return (
    <div style={{ margin: '0 0 8px', fontSize: 11, lineHeight: 1.65, color: T.ink80, textAlign: 'justify', breakInside: 'avoid' }}>
      <strong style={{ color: T.burgundy, fontWeight: 700 }}>{question.text}</strong>
      {Array.isArray(value) ? cuerpo : <> {cuerpo}</>}
    </div>
  )
}

export function PreviewFicha({ formData, onClose, isPdfGeneration = false }: PreviewFichaProps) {
  const [printing, setPrinting] = useState(false)
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const elaborationDate = format(currentDate, 'dd/MM/yyyy')
  const version = process.env.NEXT_PUBLIC_VERSION || '0.0.0'

  const nombreSDA = formData[PORTADA.nombre] || 'Ficha de transparencia'
  const versionSDA = formData[PORTADA.version]

  /* Sólo entran al documento las dimensiones con al menos una respuesta: una ficha
     donde no aplicaba ciberseguridad no debe mostrar la sección vacía. */
  const dimensiones = sections
    .map((section, i) => ({
      n: String(i + 1).padStart(2, '0'),
      title: section.title,
      respondidas: visibleQuestions(section, formData).filter(q => isAnswered(q, formData)),
    }))
    .filter(d => d.respondidas.length > 0)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: T.paper, zIndex: 50,
        overflow: 'auto', padding: '28px 20px 40px',
        display: isPdfGeneration ? 'none' : 'block',
      }}
    >
      {/* Barra de acciones — queda fuera de #ficha-preview, así no entra al PDF. */}
      {!isPdfGeneration && (
        <div style={{ maxWidth: 900, margin: '0 auto 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 16px', border: `1px solid ${T.roseLight}`, borderRadius: 9, fontSize: 13, color: T.ink80, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><I.arrow /></span> Volver al cuestionario
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11.5, color: T.ink60 }}>
              Se abrirá el diálogo de impresión: elige <strong>Guardar como PDF</strong>.
            </span>
            <PdfExportButton
              targetId="ficha-preview"
              fileName={`ficha de transparencia - ${nombreSDA}.pdf`}
              onBeforePrint={() => setPrinting(true)}
              onAfterPrint={() => setPrinting(false)}
            />
          </div>
        </div>
      )}

      <div
        id="ficha-preview"
        style={{
          maxWidth: 900, margin: '0 auto', background: '#fff', color: T.ink,
          border: `1px solid ${T.roseLight}`, borderRadius: 14,
          padding: '30px 34px 26px', overflowWrap: 'anywhere',
          printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact',
          opacity: printing ? 0.6 : 1,
        }}
      >
        {/* ── Encabezado ──
            Sin salto de página: el contenido arranca justo debajo, en la misma
            hoja. El documento es la ficha, no un informe con carátula. */}
        <header style={{ breakInside: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <LogoUAIGobLab height={32} rose={T.rose} ink={T.ink} mono={MONO} />
            <div style={{ fontWeight: 800, lineHeight: 0.95, textAlign: 'right', letterSpacing: -0.3 }}>
              <div style={{ fontSize: 11, color: T.rose }}>HERRAMIENTAS</div>
              <div style={{ fontSize: 13, color: T.ink }}>ALGORITMOS<br />ÉTICOS</div>
            </div>
          </div>

          <div style={{
            background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 12,
            padding: '18px 22px', marginBottom: 20,
            printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact',
          }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.8, color: T.burgundy, marginBottom: 6 }}>
              FICHA DE TRANSPARENCIA DEL MODELO
            </div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 28, letterSpacing: -0.8, margin: 0, lineHeight: 1.1, color: T.ink }}>
              {nombreSDA}
            </h1>
            {/* La versión es la que el equipo declaró para el SDA (pregunta 2.1),
                no la de la herramienta: esa va en el pie. */}
            <div style={{ display: 'flex', gap: 22, marginTop: 12, flexWrap: 'wrap', fontSize: 10.5, color: T.ink60 }}>
              {versionSDA && <span><strong style={{ color: T.ink80 }}>Versión:</strong> {versionSDA}</span>}
              <span><strong style={{ color: T.ink80 }}>Elaborada el:</strong> {elaborationDate}</span>
            </div>
          </div>
        </header>

        {/* ── Cuerpo: una sección por dimensión con respuestas ── */}
        <div className="print-columns" style={{ columnGap: 30 }}>
          {dimensiones.map(dim => {
            let bloqueActual: string | undefined
            // Las secciones fluyen entre columnas en vez de ser bloques
            // indivisibles: con `avoid-column`, Legal o Ciberseguridad —que no
            // caben en una columna— empujaban páginas enteras en blanco.
            return (
              <section key={dim.n} style={{ marginBottom: 16 }}>
                <h3 style={{
                  display: 'flex', alignItems: 'baseline', gap: 7, margin: '0 0 8px',
                  paddingBottom: 4, borderBottom: `1px solid ${T.roseLight}`,
                  fontFamily: SERIF, fontWeight: 500, fontSize: 15, letterSpacing: -0.3, color: T.ink,
                  // Un título no debe quedar solo al pie de una columna.
                  breakAfter: 'avoid', breakInside: 'avoid',
                  printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact',
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: T.rose }}>{dim.n}</span>
                  {dim.title}
                </h3>

                {dim.respondidas.map(q => {
                  const abreBloque = q.bloque && q.bloque !== bloqueActual
                  if (q.bloque) bloqueActual = q.bloque
                  return (
                    <React.Fragment key={q.id}>
                      {abreBloque && (
                        <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: 1.4, color: T.rose, margin: '10px 0 5px' }}>
                          {q.bloque!.toUpperCase()}
                        </div>
                      )}
                      <Dato question={q} value={formData[q.id]} />
                    </React.Fragment>
                  )
                })}
              </section>
            )
          })}
        </div>

        {/* ── Exención de responsabilidad ── */}
        <section style={{
          marginTop: 18, background: T.paperDeep, border: `1px solid ${T.line}`, borderRadius: 10,
          padding: '14px 18px', breakInside: 'avoid',
          printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.5, color: T.burgundy, marginBottom: 8 }}>
            EXENCIÓN DE RESPONSABILIDAD
          </div>
          {[
            'La ficha de transparencia es una herramienta desarrollada para apoyar la transparencia en la implementación de modelos de ciencia de datos e inteligencia artificial (IA). La ficha está diseñada únicamente como un soporte para quienes buscan entregar mayor información a sus usuarios o al público sobre el desarrollo de sus modelos, con el fin de fomentar la explicabilidad de las decisiones que utilizan IA o ciencia de datos. Esta es una herramienta de referencia, que debe ser completada con la información requerida por los encargados de las instituciones que la utilizarán.',
            'La Universidad Adolfo Ibáñez (UAI) no ofrece garantías sobre el funcionamiento o el desempeño de los sistemas de ciencia de datos e IA que utilicen esta ficha. La Universidad no es responsable de ningún tipo de daño directo, indirecto, incidental, especial o consecuente, ni de pérdidas de beneficios que puedan surgir directa o indirectamente de la aplicación de la ficha en el uso o la confianza en los resultados obtenidos a través de esta herramienta.',
            'El empleo de las herramientas desarrolladas por la Universidad no implica ni constituye un sello ni certificado de aprobación por parte de la Universidad Adolfo Ibáñez respecto al cumplimiento legal, ético o funcional de un algoritmo de inteligencia artificial. La Universidad Adolfo Ibáñez no se hace responsable de la implementación de los algoritmos de inteligencia artificial que utilicen esta ficha, ni de las decisiones que se tomen en base a la información proporcionada por la misma.',
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 9.5, lineHeight: 1.6, color: T.ink60, margin: '0 0 6px', textAlign: 'justify' }}>{p}</p>
          ))}
        </section>

        <footer style={{
          marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.roseLight}`,
          display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          fontSize: 9.5, color: T.ink60, fontFamily: MONO,
          printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact',
        }}>
          <span>GobLab UAI · Licencia MPL-2.0 · v{version}</span>
          <span>© {year} · Elaborada el {elaborationDate}</span>
        </footer>
      </div>
    </div>
  )
}
