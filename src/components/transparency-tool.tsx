'use client'

/**
 * Cuestionario de la ficha de transparencia, con el sistema visual "Civic Rose"
 * (ver src/lib/civic.ts) que ya usa la Evaluación de Impacto Algorítmico.
 *
 * Las preguntas viven en src/data/sections.ts y las reglas de visibilidad en
 * question-types.ts, compartidas con el PDF: si cada uno decidiera por su cuenta
 * qué pregunta aplica, el documento mostraría respuestas de preguntas ocultas.
 *
 * `tool_start` y el registro del correo se disparan en la portada.
 */

import { useState, useEffect, useRef } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { CustomDatePicker } from "@/components/ui/date-picker"
import 'react-datepicker/dist/react-datepicker.css'
import { PreviewFicha } from './preview-ficha'
import { T, SERIF, MONO, inputBase } from '@/lib/civic'
import { I, LogoUAIGobLab } from '@/components/civic-icons'
import { FeedbackPill } from '@/components/FeedbackPill'
import { QuestionFeedback, FlaggedLabel, type FlagState } from '@/components/QuestionFeedback'
import { SatisfactionSurvey } from '@/components/SatisfactionSurvey'
import {
  sections,
  isAnswered,
  visibleQuestions,
  sectionProgress,
  isSectionComplete,
  type Question,
  type Answers,
} from '@/data/sections'
import {
  trackSectionComplete,
  trackToolComplete,
  trackToolExport,
} from '@/lib/analytics'

function TransparencyTool() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Answers>({})
  const [isAllRequiredAnswered, setIsAllRequiredAnswered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [expandedTooltip, setExpandedTooltip] = useState<string | null>(null)
  const [flags, setFlags] = useState<Record<string, FlagState | undefined>>({})
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Encuesta de satisfacción: se pide una sola vez, en el primer intento de
  // abrir la vista previa. Nunca bloquea — omitirla también abre la ficha.
  const [surveySent, setSurveySent] = useState(false)
  const [surveyModal, setSurveyModal] = useState(false)

  // Alto real de la barra fija, para reservar espacio bajo las preguntas.
  const navbarRef = useRef<HTMLDivElement>(null)
  const [navH, setNavH] = useState(64)

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    setUserEmail(email)
    if (email && localStorage.getItem(`surveySent_${email}`)) setSurveySent(true)

    const savedAnswers = localStorage.getItem(`answers_${email}`)
    if (savedAnswers) {
      const parsedAnswers = JSON.parse(savedAnswers)
      setFormData(parsedAnswers)

      // Retomar en la última sección con respuestas.
      const lastAnsweredSection = sections.reduce((last, section) => {
        const hasAnswers = section.questions.some(q => parsedAnswers[q.id])
        return hasAnswers ? section : last
      }, sections[0])
      setActiveSection(lastAnsweredSection.id)
    }
  }, [])

  useEffect(() => {
    if (!navbarRef.current) return
    const medir = () => setNavH(navbarRef.current?.offsetHeight ?? 64)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(navbarRef.current)
    return () => ro.disconnect()
  }, [])

  /* ── Lógica de respuestas ─────────────────────────────────────── */

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const handleInputChange = (questionId: string, value: any) => {
    const newFormData = { ...formData, [questionId]: value }
    setFormData(newFormData)

    const email = localStorage.getItem('userEmail')
    if (email) {
      localStorage.setItem(`answers_${email}`, JSON.stringify(newFormData))
    }
  }

  /** Marca o desmarca una alternativa de un multiselect. */
  const toggleOption = (questionId: string, option: string) => {
    const actuales: string[] = formData[questionId] || []
    handleInputChange(
      questionId,
      actuales.includes(option) ? actuales.filter(o => o !== option) : [...actuales, option]
    )
  }

  useEffect(() => {
    const allAnswered = sections.every(section =>
      visibleQuestions(section, formData).every(q => !q.isRequired || isAnswered(q, formData))
    )
    setIsAllRequiredAnswered(allAnswered)
  }, [formData])

  const allVisible = sections.flatMap(s => visibleQuestions(s, formData))
  const progress = allVisible.length
    ? (allVisible.filter(q => isAnswered(q, formData)).length / allVisible.length) * 100
    : 0

  const sectionIndex = sections.findIndex(s => s.id === activeSection)
  const currentSection = sections[sectionIndex]
  const visibleInSection = visibleQuestions(currentSection, formData)
  const isLastSection = sectionIndex === sections.length - 1

  const handleNextSection = () => {
    if (sectionIndex < sections.length - 1) {
      trackSectionComplete(activeSection, sectionIndex, sections.length)
      setActiveSection(sections[sectionIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePreviousSection = () => {
    if (sectionIndex > 0) {
      setActiveSection(sections[sectionIndex - 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveResponses = () => {
    toast({
      title: "Respuestas guardadas",
      description: "Tus respuestas quedan guardadas en este navegador junto a tu correo.",
    })
  }

  /**
   * Abre la vista previa. La primera vez intercepta el clic para pedir la
   * encuesta de satisfacción; una vez respondida (u omitida), abre directo.
   */
  const handleOpenPreview = () => {
    if (!isAllRequiredAnswered) {
      toast({
        title: "Faltan preguntas obligatorias",
        description: "Completa todas las preguntas marcadas con * antes de generar la ficha.",
        variant: "destructive",
      })
      return
    }
    if (!surveySent) {
      setSurveyModal(true)
      return
    }
    abrirPreview()
  }

  const abrirPreview = () => {
    trackToolComplete()
    trackToolExport('pdf')
    setShowPreview(true)
  }

  const marcarEncuestaEnviada = () => {
    setSurveySent(true)
    if (userEmail) localStorage.setItem(`surveySent_${userEmail}`, '1')
  }

  const cerrarEncuestaYAbrir = () => {
    setSurveyModal(false)
    // Pequeño respiro para que el modal se desmonte antes de abrir la ficha.
    setTimeout(abrirPreview, 150)
  }

  const handleFlag = (questionId: string, state: FlagState | undefined) => {
    setFlags(prev => ({ ...prev, [questionId]: state }))
  }

  /* ── Estilos compartidos ──────────────────────────────────────── */

  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = T.burgundy
    e.target.style.boxShadow = '0 0 0 3px rgba(122,59,72,.1)'
  }
  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = T.roseLight
    e.target.style.boxShadow = 'none'
  }

  const ghostBtn: React.CSSProperties = {
    padding: '8px 14px', border: `1px solid ${T.roseLight}`, borderRadius: 9,
    fontSize: 13, color: T.ink80, background: '#fff', cursor: 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
  }
  const solidBtn: React.CSSProperties = {
    padding: '10px 20px', background: T.burgundy, color: '#fff', border: 'none',
    borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8,
  }

  /* ── Campos ───────────────────────────────────────────────────── */

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            id={question.id}
            value={formData[question.id] || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            style={inputBase}
            onFocus={focusOn}
            onBlur={focusOff}
          />
        )
      case 'textarea':
        return (
          <textarea
            id={question.id}
            value={formData[question.id] || ''}
            onChange={e => handleInputChange(question.id, e.target.value)}
            rows={4}
            placeholder={question.placeholder}
            style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6, minHeight: 100 }}
            onFocus={focusOn}
            onBlur={focusOff}
          />
        )
      case 'radio':
        return (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {question.options?.map(option => {
              const selected = formData[question.id] === option
              return (
                <label key={option} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: T.ink }}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={selected}
                    onChange={() => handleInputChange(question.id, option)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span aria-hidden style={{
                    width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                    border: `1.5px solid ${selected ? T.burgundy : T.ink40}`,
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {selected && <span style={{ width: 8, height: 8, borderRadius: 99, background: T.burgundy }} />}
                  </span>
                  {option}
                </label>
              )
            })}
          </div>
        )
      // Alternativas largas (causales legales, art. 14 ter): una lista vertical de
      // tarjetas se lee bastante mejor que un <select> nativo, donde los textos de
      // varias líneas quedan truncados.
      case 'select':
      case 'multiselect': {
        const multiple = question.type === 'multiselect'
        const marcadas: string[] = multiple ? (formData[question.id] || []) : []
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {question.options?.map(option => {
              const checked = multiple ? marcadas.includes(option) : formData[question.id] === option
              return (
                <label
                  key={option}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                    padding: '10px 13px', borderRadius: 9,
                    border: `1.5px solid ${checked ? T.burgundy : T.roseLight}`,
                    background: checked ? T.rosePaper : '#fff', transition: 'all .15s',
                  }}
                >
                  <input
                    type={multiple ? 'checkbox' : 'radio'}
                    name={question.id}
                    checked={checked}
                    onChange={() => multiple
                      ? toggleOption(question.id, option)
                      : handleInputChange(question.id, option)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span aria-hidden style={{
                    width: 17, height: 17, borderRadius: multiple ? 4 : 99, flexShrink: 0, marginTop: 2,
                    border: `1.5px solid ${checked ? T.burgundy : T.ink40}`,
                    background: checked && multiple ? T.burgundy : '#fff', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                  }}>
                    {checked && (multiple
                      ? <I.check width={10} height={10} />
                      : <span style={{ width: 8, height: 8, borderRadius: 99, background: T.burgundy }} />)}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: checked ? T.ink : T.ink80 }}>{option}</span>
                </label>
              )
            })}
          </div>
        )
      }
      case 'slider':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="range"
              id={question.id}
              min={question.min}
              max={question.max}
              step={question.step}
              value={formData[question.id] ?? question.min ?? 0}
              onChange={e => handleInputChange(question.id, Number(e.target.value))}
              style={{ width: '100%', accentColor: T.burgundy }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.ink60, fontFamily: MONO }}>
              <span>{question.min}</span>
              <span style={{ color: T.burgundy, fontWeight: 700 }}>{formData[question.id] ?? question.min ?? 0}</span>
              <span>{question.max}</span>
            </div>
          </div>
        )
      case 'date':
        return (
          <CustomDatePicker
            selected={formData[question.id] ? new Date(formData[question.id]) : null}
            onChange={(date: Date | null) => handleInputChange(question.id, date ? date.toISOString() : null)}
          />
        )
      default:
        return null
    }
  }

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div style={{ background: T.paper, minHeight: '100vh', color: T.ink, display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{ background: '#fff', borderBottom: `1px solid ${T.roseLight}`, padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
          <LogoUAIGobLab height={34} rose={T.rose} ink={T.ink} mono={MONO} />
          <div className="ft-logo-sep" style={{ width: 1, height: 22, background: T.roseLight }} />
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: T.ink60 }}>HERRAMIENTA</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 1 }}>Herramienta de Transparencia Algorítmica</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: T.ink60 }}>{Math.round(progress)}% completo</div>
          <div style={{ width: 110, height: 5, background: T.paperDeep, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${T.rose},${T.burgundy})`, transition: 'width .4s cubic-bezier(.16,1,.3,1)' }} />
          </div>
          <button onClick={handleSaveResponses} style={ghostBtn}>Guardar</button>
        </div>
      </header>

      <div className="ft-shell" style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>

        {/* ── Sidebar de secciones ── */}
        <aside className="ft-aside" style={{ background: '#fff', borderRight: `1px solid ${T.roseLight}`, position: 'sticky', top: 0, alignSelf: 'start', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${T.roseLight}` }}>
            <div style={{ fontSize: 11, fontFamily: MONO, letterSpacing: 1, color: T.ink60, marginBottom: 4 }}>SDA DOCUMENTADO</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.35 }}>
              {formData.nombreModelo1 || 'Sistema sin nombre'}
            </div>
          </div>
          <nav style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            {sections.map((section, i) => {
              const active = activeSection === section.id
              const done = isSectionComplete(section, formData)
              return (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
                    border: 'none', fontFamily: 'inherit', transition: 'background .15s',
                    background: active ? T.burgundy : 'transparent',
                    color: active ? '#fff' : done ? T.ink80 : T.ink60,
                  }}
                >
                  <span style={{
                    width: 25, height: 25, borderRadius: 99, flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700,
                    fontFamily: MONO, transition: 'all .15s',
                    background: active || done ? T.rose : 'transparent',
                    color: active || done ? '#fff' : T.ink40,
                    border: !active && !done ? `1.5px solid ${T.ink20}` : 'none',
                  }}>{done ? <I.check width={13} height={13} /> : String(i + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 600 : 400, lineHeight: 1.35 }}>{section.title}</span>
                  <span style={{ fontSize: 11.5, fontFamily: MONO, color: active ? T.roseLight : T.ink40 }}>
                    {sectionProgress(section, formData)}%
                  </span>
                </button>
              )
            })}
          </nav>
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.roseLight}`, fontSize: 12.5, color: T.ink60, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: T.burgundy, display: 'inline-flex' }}><I.lock /></span> Auto-guardado local
          </div>
        </aside>

        {/* ── Preguntas de la sección ── */}
        {/* El padding inferior reserva el alto de la barra fija. */}
        <main style={{ padding: '28px 36px 0', paddingBottom: navH + 36, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 99, background: T.rose, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {String(sectionIndex + 1).padStart(2, '0')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 26, letterSpacing: -0.6, margin: 0, lineHeight: 1.1 }}>{currentSection.title}</h2>
              <div style={{ fontSize: 12, color: T.ink60, marginTop: 2 }}>
                {visibleInSection.length} {visibleInSection.length === 1 ? 'pregunta' : 'preguntas'} · Sección {sectionIndex + 1} de {sections.length}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontFamily: MONO, color: T.ink60, letterSpacing: 1 }}>AVANCE</div>
              <div style={{ fontFamily: SERIF, fontSize: 22, color: T.burgundy, lineHeight: 1 }}>
                {sectionProgress(currentSection, formData)}<span style={{ color: T.ink40, fontSize: 14 }}>%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(192,138,147,.08)', borderLeft: `3px solid ${T.rose}`, borderRadius: '0 8px 8px 0', marginBottom: 22, fontSize: 13, color: T.ink80 }}>
            <span style={{ color: T.rose, display: 'inline-flex', flexShrink: 0 }}><I.help width={14} height={14} /></span>
            Cada pregunta incluye un ícono de ayuda con información adicional. Las marcadas con <strong style={{ color: T.burgundy }}>*</strong> son obligatorias.
          </div>

          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {visibleInSection.map((question, qIndex) => (
              <div key={question.id} style={{ display: 'contents' }}>
                {/* Subtítulo de bloque: Legal agrupa 35 preguntas en 8 temas y sin
                    esta separación se lee como una lista interminable. */}
                {question.bloque && question.bloque !== visibleInSection[qIndex - 1]?.bloque && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: qIndex ? 14 : 0 }}>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.6, color: T.burgundy, whiteSpace: 'nowrap' }}>
                      {question.bloque.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, height: 1, background: T.roseLight }} />
                  </div>
                )}

                <div style={{ background: '#fff', border: `1px solid ${T.roseLight}`, borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <label htmlFor={question.id} style={{ fontSize: 14, fontWeight: 500, color: T.ink, lineHeight: 1.45 }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: T.burgundy, marginRight: 6 }}>
                      {question.numero}
                    </span>
                    {question.text}
                    {question.isRequired && <span style={{ color: T.burgundy, marginLeft: 3 }}>*</span>}
                    {flags[question.id] === 'down' && <FlaggedLabel />}
                  </label>

                  {question.tooltip?.trim() && (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        type="button"
                        aria-label="Mostrar información adicional"
                        onClick={() => setExpandedTooltip(prev => prev === question.id ? null : question.id)}
                        style={{ width: 24, height: 24, borderRadius: 99, border: `1.5px solid ${T.roseLight}`, background: expandedTooltip === question.id ? T.rosePaper : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: expandedTooltip === question.id ? T.burgundy : T.ink60 }}
                      >
                        <I.help />
                      </button>

                      {expandedTooltip === question.id && (
                        <div
                          style={{ position: 'absolute', right: 0, top: 30, zIndex: 50, width: 'min(90vw, 340px)', padding: '16px 18px', borderRadius: 12, border: `1px solid ${T.roseLight}`, background: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,.14)', maxHeight: '50vh', overflowY: 'auto' }}
                          onClick={e => e.stopPropagation()}
                          role="dialog"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedTooltip(null)}
                            aria-label="Cerrar"
                            style={{ position: 'absolute', right: 10, top: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: T.ink60, padding: 2 }}
                          >
                            <I.close width={14} height={14} />
                          </button>
                          <div style={{ fontSize: 13, color: T.ink80, lineHeight: 1.6, paddingRight: 14 }}>
                            {question.tooltip.split('\n').map((paragraph, i) => (
                              <p key={i} style={{ margin: '0 0 8px', textAlign: 'justify' }}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {renderQuestionInput(question)}

                <QuestionFeedback
                  questionId={question.id}
                  flag={flags[question.id]}
                  onFlag={state => handleFlag(question.id, state)}
                  email={userEmail || undefined}
                  context={{
                    pantalla: 'cuestionario',
                    seccion: `${String(sectionIndex + 1).padStart(2, '0')} ${currentSection.title}`,
                    pregunta: question.numero,
                    questionId: question.id,
                    progreso: progress,
                  }}
                />
                </div>
              </div>
            ))}
          </form>
        </main>

        {/* Barra de navegación: anclada al viewport, siempre visible.
            Arranca después del sidebar en escritorio (ver .ft-navbar). */}
        <div ref={navbarRef} className="ft-navbar" style={{ position: 'fixed', bottom: 0, left: 280, right: 0, zIndex: 40, background: '#fff', borderTop: `1px solid ${T.roseLight}`, padding: '14px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', boxShadow: '0 -4px 20px rgba(0,0,0,.06)' }}>
          <button onClick={handlePreviousSection} disabled={sectionIndex === 0} style={{ ...ghostBtn, opacity: sectionIndex === 0 ? 0.4 : 1, cursor: sectionIndex === 0 ? 'not-allowed' : 'pointer' }}>
            <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><I.arrow /></span> Anterior
          </button>
          <div style={{ fontSize: 12, color: T.ink60, fontFamily: MONO, letterSpacing: 0.5 }}>
            Sección {sectionIndex + 1} de {sections.length} · <span style={{ color: T.burgundy, fontWeight: 600 }}>Guardado automáticamente</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleOpenPreview}
              title={isAllRequiredAnswered ? undefined : 'Completa las preguntas obligatorias para generar la ficha'}
              style={{ ...ghostBtn, opacity: isAllRequiredAnswered ? 1 : 0.5 }}
            >
              <I.download /> Vista previa / PDF
            </button>
            <button onClick={handleNextSection} disabled={isLastSection} style={{ ...solidBtn, opacity: isLastSection ? 0.4 : 1, cursor: isLastSection ? 'not-allowed' : 'pointer' }}>
              Siguiente <I.arrow />
            </button>
          </div>
        </div>
      </div>

      {/* La pill sube para no quedar tapada por la barra fija. */}
      <FeedbackPill
        bottom={navH + 16}
        defaultEmail={userEmail || ''}
        context={{
          pantalla: 'cuestionario',
          seccion: `${String(sectionIndex + 1).padStart(2, '0')} ${currentSection.title}`,
          progreso: progress,
        }}
      />

      {/* ── Encuesta de satisfacción (una sola vez, antes de la ficha) ── */}
      {surveyModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,.5)', zIndex: 110, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto' }}
          onClick={cerrarEncuestaYAbrir}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: T.paper, borderRadius: 18, padding: '26px 28px', width: '100%', maxWidth: 720, boxShadow: '0 24px 64px rgba(0,0,0,.24)', margin: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: T.burgundy, marginBottom: 8 }}>ANTES DE DESCARGAR</div>
                <h2 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 28, letterSpacing: -0.8, margin: 0, lineHeight: 1.1 }}>
                  Evalúa esta <em style={{ color: T.burgundy }}>herramienta</em>.
                </h2>
                <p style={{ fontSize: 13, color: T.ink60, margin: '8px 0 0', lineHeight: 1.6 }}>
                  Toma menos de dos minutos y solo te la pedimos una vez. Puedes omitirla: tu ficha se genera igual.
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarEncuestaYAbrir}
                aria-label="Omitir encuesta"
                style={{ width: 28, height: 28, border: `1px solid ${T.roseLight}`, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink60, background: '#fff', cursor: 'pointer', flexShrink: 0 }}
              >
                <I.close width={14} height={14} />
              </button>
            </div>

            <SatisfactionSurvey
              embedded
              email={userEmail || undefined}
              progreso={progress}
              onSent={() => { marcarEncuestaEnviada(); setTimeout(cerrarEncuestaYAbrir, 1200) }}
            />

            <button type="button" onClick={cerrarEncuestaYAbrir} style={{ ...ghostBtn, marginTop: 16 }}>
              Omitir y ver la ficha <I.arrow />
            </button>
          </div>
        </div>
      )}

      {showPreview && (
        <PreviewFicha
          formData={formData}
          onClose={() => setShowPreview(false)}
        />
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          .ft-shell { grid-template-columns: 1fr !important; }
          .ft-aside {
            position: static !important;
            max-height: none !important;
            border-right: none !important;
            border-bottom: 1px solid ${T.roseLight};
          }
          .ft-navbar { left: 0 !important; padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (max-width: 560px) {
          .ft-logo-sep { display: none; }
        }
      `}</style>
    </div>
  )
}

export default TransparencyTool;
