/**
 * Capturas de la Ficha de Transparencia para el manual de usuario.
 * Levanta un Chrome propio y lo maneja por CDP; escribe en docs/manual/img.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:3000'
const OUT = '/Users/johanpina/dev/Herramientas_Goblab/herramienta_transparencia_modelo/docs/manual/img'
const EMAIL = 'equipo@ejemplo.cl'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1440, height: 950, deviceScaleFactor: 2 },
  args: ['--hide-scrollbars', '--force-device-scale-factor=2'],
})
const page = await browser.newPage()

const shot = async (nombre, opts = {}) => {
  await new Promise(r => setTimeout(r, 450))
  await page.screenshot({ path: `${OUT}/${nombre}.png`, ...opts })
  console.log('  ✓', nombre + '.png')
}

/** Siembra localStorage y entra al cuestionario. */
async function entrarAlCuestionario({ respuestas = true, contexto = 'chile', encuestaHecha = true } = {}) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
  await page.evaluate(async (email, conRespuestas, ctx, hecha) => {
    localStorage.clear()
    localStorage.setItem('userEmail', email)
    localStorage.setItem('contextoFicha', ctx)
    if (hecha) localStorage.setItem('surveySent_' + email, '1')
    if (conRespuestas) {
      const a = await (await fetch('/__manual.json')).json()
      localStorage.setItem('answers_' + email, JSON.stringify(a))
    }
  }, EMAIL, respuestas, contexto, encuestaHecha)
  await page.goto(`${BASE}/herramienta-transparencia?contexto=${contexto}`, { waitUntil: 'networkidle0' })
}

const irASeccion = titulo => page.evaluate(t => {
  const b = [...document.querySelectorAll('nav button')].find(x => x.textContent.includes(t))
  b?.click()
}, titulo)

console.log('Capturando…')

/* 1. Portada completa */
await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
await shot('ui_portada', { fullPage: true })

/* 2. Formulario de inicio con el selector de contexto */
await page.evaluate(() => {
  document.querySelector('[aria-label="Contexto normativo de la ficha"]')
    ?.closest('form')?.scrollIntoView({ block: 'center' })
})
await shot('ui_inicio')

/* 3. Cuestionario en blanco */
await entrarAlCuestionario({ respuestas: false })
await shot('ui_cuestionario')

/* 4. Ayuda de una pregunta abierta */
await page.evaluate(() => {
  document.querySelector('button[aria-label="Mostrar información adicional"]')?.click()
})
await shot('ui_tooltip')

/* 5. Legal: bloques temáticos */
await entrarAlCuestionario()
await irASeccion('Legal')
await shot('ui_bloques')

/* 6. Alternativas de selección múltiple */
await page.evaluate(() => {
  const l = [...document.querySelectorAll('label')].find(x => /^4\.8/.test(x.textContent))
  l?.closest('div[style*="border-radius: 12px"]')?.scrollIntoView({ block: 'center' })
})
await shot('ui_multiselect')

/* 7. Micro-feedback por pregunta */
await entrarAlCuestionario()
await page.evaluate(() => {
  document.querySelector('button[aria-label="La pregunta no fue clara"]')?.click()
})
await shot('ui_feedback_pregunta')

/* 8. Aviso de obligatorias pendientes */
await entrarAlCuestionario({ respuestas: false })
await page.evaluate(() => {
  [...document.querySelectorAll('button')].find(b => b.textContent.includes('Vista previa'))?.click()
})
await new Promise(r => setTimeout(r, 700))
await shot('ui_pendientes')

/* 9. Encuesta de satisfacción */
await entrarAlCuestionario({ encuestaHecha: false })
await page.evaluate(() => {
  [...document.querySelectorAll('button')].find(b => b.textContent.includes('Vista previa'))?.click()
})
await new Promise(r => setTimeout(r, 700))
await shot('ui_encuesta')

/* 10. Vista previa de la ficha */
await entrarAlCuestionario()
await page.evaluate(() => {
  [...document.querySelectorAll('button')].find(b => b.textContent.includes('Vista previa'))?.click()
})
await new Promise(r => setTimeout(r, 700))
await shot('ui_ficha')

/* 11. Documento completo */
await shot('ui_ficha_completa', { fullPage: true })

/* 12. Contexto internacional en el encabezado */
await entrarAlCuestionario({ contexto: 'internacional' })
await irASeccion('Ciberseguridad')
await shot('ui_contexto_internacional')

await browser.close()
console.log('listo')
