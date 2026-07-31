'use client'

/**
 * Portada de la Ficha de Transparencia, con el sistema visual "Civic Rose"
 * (ver src/lib/civic.ts) que ya usa la Evaluación de Impacto Algorítmico.
 *
 * El registro del correo y `tool_start` se disparan aquí, al iniciar la ficha;
 * antes vivían en el montaje de transparency-tool.tsx, donde el evento se
 * emitía dos veces al volver a entrar con respuestas guardadas.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { T, SERIF, MONO } from '@/lib/civic'
import { I, LogoUAIGobLab } from '@/components/civic-icons'
import { FeedbackPill } from '@/components/FeedbackPill'
import { sections } from '@/data/sections'
import { trackToolStart, registerToolUser } from '@/lib/analytics'

/* ── Rótulo "Herramientas Algoritmos Éticos" en texto ─────────────── */
function LogoHerramientas({ scale = 0.7 }: { scale?: number }) {
  return (
    <div style={{ fontWeight: 800, lineHeight: 0.95, textAlign: 'right', letterSpacing: -0.3 }}>
      <div style={{ fontSize: 18 * scale, color: T.rose }}>HERRAMIENTAS</div>
      <div style={{ fontSize: 22 * scale, color: T.ink }}>ALGORITMOS<br />ÉTICOS</div>
    </div>
  )
}

/**
 * Rótulos del grafo: el título completo de algunas secciones no cabe en el
 * viewBox, así que se cortan a mano con "·" marcando el salto de línea (misma
 * convención que la EIA). El orden sigue al de `sections`; si se agrega una
 * sección sin entrada aquí, se cae al título completo.
 */
const GRAPH_LABELS: Record<string, string> = {
  'Categorización o elaboración de perfiles': 'Categorización · y perfiles',
  'Advertencias y recomendaciones': 'Advertencias y · recomendaciones',
  'Consideraciones éticas': 'Consideraciones · éticas',
  'Datos de entrenamiento': 'Datos de · entrenamiento',
  'Datos de evaluación': 'Datos de · evaluación',
  'Métricas de desempeño': 'Métricas de · desempeño',
  'Detalles del modelo': 'Detalles del · modelo',
}

/* ── Grafo radial de las secciones del cuestionario ───────────────── */
function SectionGraph() {
  const CX = 400, CY = 400, R = 180
  // Las coordenadas se redondean a propósito: sin esto, el servidor y el
  // navegador serializan los flotantes de cos/sin con distinta precisión y React
  // reporta un desajuste de hidratación en cada nodo del grafo.
  const r2 = (v: number) => Math.round(v * 100) / 100
  const nodes = sections.map((s, i) => {
    const angle = (i / sections.length) * Math.PI * 2 - Math.PI / 2
    return {
      n: String(i + 1).padStart(2, '0'),
      title: GRAPH_LABELS[s.title] ?? s.title,
      x: r2(CX + Math.cos(angle) * R),
      y: r2(CY + Math.sin(angle) * R),
    }
  })

  return (
    <svg viewBox="0 0 800 800" style={{ width: '100%', maxWidth: 680 }}>
      <defs>
        <radialGradient id="ft-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={T.rose} stopOpacity="0.15" />
          <stop offset="70%" stopColor={T.rose} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r="220" fill="url(#ft-glow)" />

      {[220, 170, 120, 70].map((rr, i) => (
        <circle key={i} cx={CX} cy={CY} r={rr} fill="none" stroke={T.roseLight} strokeWidth="1" strokeDasharray={i % 2 ? '2 5' : '0'} />
      ))}

      {nodes.map((n, i) => (
        <line key={'sp' + i} x1={CX} y1={CY} x2={n.x} y2={n.y} stroke={T.roseLight} strokeWidth="1" />
      ))}

      <polygon points={nodes.map(n => `${n.x},${n.y}`).join(' ')} fill={T.rose} fillOpacity="0.09" stroke={T.rose} strokeWidth="1.5" />

      {([[0, 3], [1, 5], [2, 6], [4, 7], [0, 5]] as const).map(([a, b], i) => (
        <line key={'x' + i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={T.rose} strokeOpacity="0.16" strokeWidth="1" strokeDasharray="1 3" />
      ))}

      {nodes.map(n => (
        <g key={n.n}>
          <circle cx={n.x} cy={n.y} r="22" fill="#fff" stroke={T.rose} strokeWidth="1.5" />
          <circle cx={n.x} cy={n.y} r="13" fill={T.rose} />
          <text x={n.x} y={n.y + 4} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontFamily={MONO} fontWeight="700" fontSize="11">{n.n}</text>
        </g>
      ))}

      <g transform={`translate(${CX},${CY})`}>
        <circle r="62" fill="#fff" stroke={T.rose} strokeWidth="1.5" />
        <circle r="52" fill={T.rosePaper} />
        <text y="-7" textAnchor="middle" fill={T.burgundy} fontFamily={SERIF} fontStyle="italic" fontSize="30" fontWeight="500">FT</text>
        <text y="14" textAnchor="middle" fill={T.ink60} fontFamily={MONO} fontSize="8" letterSpacing="1.5">{sections.length} SECCIONES</text>
      </g>

      {/* Etiquetas: los títulos largos se parten en dos líneas para que no
          invadan el círculo ni se salgan del viewBox. */}
      {nodes.map((n, i) => {
        const dx = n.x - CX, dy = n.y - CY
        const len = Math.sqrt(dx * dx + dy * dy)
        const LABEL_R = 248
        const lx = r2(CX + (dx / len) * LABEL_R), ly = r2(CY + (dy / len) * LABEL_R)
        const anchor = dx > 15 ? 'start' : dx < -15 ? 'end' : 'middle'

        const parts = n.title.split('·').map(p => p.trim())

        const lineH = 15
        const totalH = parts.length * lineH
        const maxLen = Math.max(...parts.map(p => p.length))
        const estW = maxLen * 7 + 8
        const bx = anchor === 'start' ? lx - 4 : anchor === 'end' ? lx - estW + 4 : lx - estW / 2
        const by = ly - totalH / 2 - 4
        return (
          <g key={'lb' + i}>
            <rect x={bx} y={by} width={estW} height={totalH + 8} rx="5" fill="white" opacity="0.92" />
            <text textAnchor={anchor} fill={T.ink} fontSize="12" fontWeight="600">
              {parts.map((p, pi) => (
                <tspan key={pi} x={lx} y={ly + (pi - (parts.length - 1) / 2) * lineH}>{p}</tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Contenido de la portada ──────────────────────────────────────── */
const WHY_CARDS = [
  {
    icon: I.target,
    q: '¿Por qué utilizarla?',
    items: [
      'Transparenta el funcionamiento de un algoritmo ante usuarios finales y actores externos.',
      'Sirve como estándar de documentación interna de los sistemas automatizados de la organización.',
      'Facilita el cumplimiento de estándares de transparencia algorítmica y fortalece la rendición de cuentas.',
    ],
  },
  {
    icon: I.doc,
    q: '¿En qué consiste?',
    items: [
      `Un cuestionario de ${sections.length} secciones que recorre el ciclo de vida del SDA: propósito, datos, métricas, consideraciones éticas y vías de reclamación.`,
      'Cada pregunta trae una ayuda con ejemplos para orientar la respuesta.',
    ],
  },
  {
    icon: I.flag,
    q: '¿Qué obtienes?',
    items: [
      'Una ficha de transparencia en PDF, lista para publicar o entregar a terceros.',
    ],
  },
]

const STEPS: [string, string][] = [
  ['01', 'Ingresa tu correo'],
  ['02', 'Completa la ficha'],
  ['03', 'Descarga el PDF'],
  ['04', 'Evalúa la herramienta'],
]

/** Párrafos introductorios, tal como estaban en la portada anterior. */
const INTRO = [
  'Una ficha de transparencia es un documento claro, accesible y fácil de entender que resume la información clave sobre un sistema de decisiones automatizado (SDA). Este instrumento cumple una doble función: transparentar el funcionamiento de un algoritmo ante usuarios finales y actores externos, y servir como estándar de documentación interna para los sistemas automatizados implementados por organizaciones públicas o privadas.',
  'Esta herramienta tiene como objetivo apoyar a instituciones de diversos sectores en la elaboración de fichas de transparencia para sistemas de decisiones automatizadas o semiautomatizadas (SDA), promoviendo una gestión responsable, ética y comprensible de estos sistemas. Su uso facilita el cumplimiento de estándares de transparencia algorítmica y contribuye a fortalecer la rendición de cuentas institucional, la confianza pública y el diseño centrado en las personas.',
  'En esta herramienta, utilizamos el término SDA (Sistema de Decisiones Automatizado) para referirnos a algoritmos, sistemas de inteligencia artificial o modelos de aprendizaje automático (machine learning) que intervienen en procesos de toma de decisiones, ya sea de forma automática o asistida. Elegimos este término para alinearnos con las Recomendaciones de Transparencia Algorítmica del Consejo para la Transparencia (CPLT), las cuales promueven su uso en el contexto nacional. Las preguntas del cuestionario incorporan y organizan los contenidos sugeridos por el CPLT, ayudando así a identificar áreas clave a transparentar y avanzar en el cumplimiento de buenas prácticas de gobernanza algorítmica.',
  'La herramienta está diseñada para ser utilizada con sistemas que ya han sido desarrollados y que se encuentran próximos a su implementación o etapa de pilotaje. Se recomienda que sea completada por un equipo multidisciplinario que incluya perfiles como jefatura de proyecto, analistas o científicos de datos, responsables de datos, asesores legales, encargados de comunicaciones, y otros roles que la organización considere relevantes para reflejar adecuadamente el ciclo de vida del SDA.',
]

const DISCLAIMER = [
  'La ficha de transparencia es, como su nombre lo indica, una herramienta desarrollada para apoyar la transparencia en la implementación de modelos de ciencia de datos e inteligencia artificial (IA). La ficha está diseñada únicamente como un soporte para quienes buscan entregar mayor información a sus usuarios o al público sobre el desarrollo de sus modelos, con el fin de fomentar la explicabilidad de las decisiones que utilizan IA o ciencia de datos. Esta es una herramienta de referencia, que debe ser completada con la información requerida por los encargados de las instituciones que la utilizarán.',
  'La Universidad Adolfo Ibáñez (UAI) no ofrece garantías sobre el funcionamiento o el desempeño de los sistemas de ciencia de datos e IA que utilicen esta ficha. La Universidad no es responsable de ningún tipo de daño directo, indirecto, incidental, especial o consecuente, ni de pérdidas de beneficios que puedan surgir directa o indirectamente de la aplicación de la ficha en el uso o la confianza en los resultados obtenidos a través de esta herramienta.',
  'El empleo de las herramientas desarrolladas por la Universidad no implica ni constituye un sello ni certificado de aprobación por parte de la Universidad Adolfo Ibáñez respecto al cumplimiento legal, ético o funcional de un algoritmo de inteligencia artificial. La Universidad Adolfo Ibáñez no se hace responsable de la implementación de los algoritmos de inteligencia artificial que utilicen esta ficha, ni de las decisiones que se tomen en base a la información proporcionada por la misma.',
]

/* ── Página ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [starting, setStarting] = useState(false)
  const router = useRouter()
  const VERSION = process.env.NEXT_PUBLIC_VERSION || '0.0.0'

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStarting(true)

    localStorage.setItem('userEmail', email)
    const savedAnswers = localStorage.getItem(`answers_${email}`)
    if (savedAnswers) localStorage.setItem('currentAnswers', savedAnswers)

    await registerToolUser(email)
    trackToolStart()

    setStarting(false)
    router.push('/herramienta-transparencia')
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', border: `1px solid ${T.roseLight}`, background: T.rosePaper,
    borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ background: '#fff', color: T.ink, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Barra superior ── */}
      <header style={{ padding: '14px 40px', background: '#fff', borderBottom: `1px solid ${T.roseLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', minWidth: 0 }}>
          <LogoUAIGobLab height={36} rose={T.rose} ink={T.ink} mono={MONO} />
          <div className="ft-logo-sep" style={{ width: 1, height: 24, background: T.roseLight }} />
          <LogoHerramientas scale={0.7} />
        </div>
        <span style={{ background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 99, padding: '5px 12px', fontSize: 12, color: T.burgundy, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <I.globe /> ES
        </span>
      </header>

      {/* ── Hero ── */}
      <section className="ft-hero" style={{ background: T.rosePaper, borderBottom: `1px solid ${T.roseLight}` }}>
        <div className="ft-hero-copy" style={{ padding: '48px 44px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: `1px solid ${T.roseLight}` }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 99, background: '#fff', color: T.burgundy, fontSize: 11, fontWeight: 600, letterSpacing: 0.4, marginBottom: 18, border: `1px solid ${T.roseLight}` }}>
            <span style={{ width: 6, height: 6, background: T.rose, borderRadius: 99 }} /> Herramienta · v{VERSION} · {sections.length} secciones
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 1.02, margin: '0 0 16px', letterSpacing: -1.5, color: T.ink }}>
            Ficha de<br /><em style={{ color: T.burgundy }}>transparencia</em> del modelo.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: T.ink60, margin: '0 0 32px', maxWidth: 460 }}>
            Documenta tu sistema de decisiones automatizado en un lenguaje claro y accesible, y obtén un documento listo para publicar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
            {WHY_CARDS.map((card, ci) => (
              <div key={ci} style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: T.rosePaper, color: T.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <card.icon />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{card.q}</div>
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {card.items.map((item, ii) => (
                    <li key={ii} style={{ fontSize: 12.5, color: T.ink60, lineHeight: 1.5 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 10px', background: `radial-gradient(circle at 50% 50%, ${T.rosePaper} 0%, #fff 75%)` }}>
          <SectionGraph />
        </div>
      </section>

      {/* ── Pasos ── */}
      <section style={{ padding: '28px 40px', background: '#fff', borderBottom: `1px solid ${T.roseLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 860, flexWrap: 'wrap', gap: '10px 0' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 99, background: i === 0 ? T.burgundy : T.rosePaper, color: i === 0 ? '#fff' : T.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.ink80, whiteSpace: 'nowrap' }}>{s[1]}</div>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: T.roseLight, margin: '0 14px', minWidth: 20 }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Qué es una ficha de transparencia ── */}
      <section style={{ padding: '40px 40px 36px', background: '#fff', borderBottom: `1px solid ${T.roseLight}` }}>
        <div style={{ maxWidth: 1120, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: T.burgundy, marginBottom: 10 }}>SOBRE LA HERRAMIENTA</div>
            <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 30, letterSpacing: -0.8, margin: 0, lineHeight: 1.15 }}>
              ¿Qué es una ficha de transparencia?
            </h2>
          </div>
          <div className="ft-intro" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 36px' }}>
            {INTRO.map((p, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: T.ink80, margin: 0, textAlign: 'justify' }}>{p}</p>
            ))}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: T.ink60, margin: 0, maxWidth: 900 }}>
            Esta herramienta se inspira en el enfoque de <em>Model Cards for Model Reporting</em> (Mitchell et al., 2019), adaptado al contexto del sector público chileno con las{' '}
            <a
              href="https://www.consejotransparencia.cl/wp-content/uploads/destacados/2025/03/GUIA-Transparencia-Algoritmica_ene2025_v3.pdf-copia.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: T.burgundy, fontWeight: 600, textDecoration: 'none' }}
            >
              Recomendaciones de Transparencia Algorítmica
            </a>{' '}
            y a los principios éticos que deben guiar el uso de sistemas algorítmicos en cualquier organización.
          </p>
        </div>
      </section>

      {/* ── Formulario + avisos ── */}
      <section className="ft-form-grid" style={{ padding: '32px 40px', background: T.rosePaper, flex: 1 }}>

        <form onSubmit={handleStart} style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 16, padding: '26px 28px', alignSelf: 'start' }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Comienza tu ficha de transparencia</div>
          <p style={{ fontSize: 12.5, color: T.ink60, lineHeight: 1.55, margin: '0 0 20px' }}>
            Tus respuestas se guardan en este navegador asociadas a tu correo, así puedes retomar la ficha más tarde.
          </p>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="email" style={{ fontSize: 12, fontWeight: 600, color: T.ink80, display: 'block', marginBottom: 5 }}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              placeholder="nombre@ejemplo.cl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={fieldStyle}
            />
          </div>

          <button
            type="submit"
            disabled={starting}
            style={{ width: '100%', background: T.burgundy, color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: starting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'inherit', letterSpacing: 0.5, opacity: starting ? 0.7 : 1 }}
          >
            {starting ? 'INICIANDO…' : <>INICIAR FICHA <I.arrow /></>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 11.5, color: T.ink60 }}>
            <span style={{ color: T.burgundy, display: 'inline-flex' }}><I.lock width={12} height={12} /></span>
            Las preguntas marcadas con <strong style={{ color: T.burgundy }}>*</strong> son obligatorias para descargar la ficha.
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 99, background: T.rosePaper, color: T.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.users /></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.burgundy }}>Mejor en equipo</div>
            </div>
            <p style={{ fontSize: 13, color: T.ink80, margin: 0, lineHeight: 1.6 }}>
              Recomendamos completarla con perfiles de <strong>jefatura de proyecto, ciencia de datos, legal</strong> y <strong>comunicaciones</strong>, para reflejar todo el ciclo de vida del SDA.
            </p>
          </div>

          <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: T.burgundy }}>
              <I.lock />
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Privacidad</div>
            </div>
            <p style={{ fontSize: 12.5, color: T.ink60, margin: 0, lineHeight: 1.6 }}>
              La información que ingreses en la ficha no se almacena en la plataforma: se procesa localmente en tu navegador. El correo se usa únicamente para el registro de uso de la herramienta y con fines estadísticos, y nunca se comparte con terceros.
            </p>
          </div>

          <details style={{ background: T.rosePaper, border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '16px 18px' }}>
            <summary style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: T.ink60, cursor: 'pointer' }}>
              EXENCIÓN DE RESPONSABILIDAD
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DISCLAIMER.map((p, i) => (
                <p key={i} style={{ fontSize: 12, color: T.ink60, margin: 0, lineHeight: 1.6, textAlign: 'justify' }}>{p}</p>
              ))}
              <p style={{ fontSize: 12, color: T.ink60, margin: 0, lineHeight: 1.6, textAlign: 'justify' }}>
                Quienes quieran ser considerados como caso de éxito mediante el uso de estas herramientas de IA responsable pueden inscribirse en los pilotos en{' '}
                <a href="https://algoritmospublicos.cl/quiero_participar" target="_blank" rel="noopener noreferrer" style={{ color: T.burgundy, fontWeight: 600, textDecoration: 'none' }}>
                  algoritmospublicos.cl/quiero_participar
                </a>. El uso de nuestras herramientas y sus resultados no aseguran por sí mismos que un algoritmo cumpla con los estándares éticos requeridos.
              </p>
            </div>
          </details>

          <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: T.ink60, marginBottom: 12 }}>AGRADECIMIENTOS</div>
            <Image src="/images/ANID.png" alt="Agencia Nacional de Investigación y Desarrollo" width={150} height={50} style={{ height: 'auto' }} />
            <p style={{ fontSize: 12, color: T.ink60, margin: '10px 0 0', lineHeight: 1.6 }}>
              Subdirección de Investigación Aplicada / Concurso IDeA I+D 2023, proyecto ID23I10357.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pie ── */}
      <footer style={{ padding: '14px 40px', background: T.ink, color: 'rgba(255,255,255,.75)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span>Desarrollado por <strong style={{ color: '#fff' }}>GobLab UAI</strong> · Escuela de Gobierno UAI</span>
        <span style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7 }}>ANID ID23I10357</span>
      </footer>

      <FeedbackPill context={{ pantalla: 'portada' }} defaultEmail={email} />

      <style jsx>{`
        .ft-hero {
          display: grid;
          grid-template-columns: minmax(360px, 1fr) minmax(560px, 1.2fr);
        }
        .ft-form-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 28px;
        }
        @media (max-width: 1100px) {
          .ft-hero { grid-template-columns: 1fr; }
          .ft-hero-copy { border-right: none !important; }
          .ft-form-grid { grid-template-columns: 1fr; }
          .ft-intro { grid-template-columns: 1fr !important; }
        }
        /* Con el logo institucional envuelto, el separador vertical sobra. */
        @media (max-width: 560px) {
          .ft-logo-sep { display: none; }
        }
      `}</style>
    </div>
  )
}
