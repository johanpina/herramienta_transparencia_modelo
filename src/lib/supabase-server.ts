/**
 * Utilidades de servidor para las rutas /api que escriben en Supabase.
 * Solo se importan desde route handlers: la anon key nunca llega al navegador.
 *
 * Mismo contrato que src/lib/supabase-server.ts de la EIA: ambas herramientas
 * escriben en el mismo proyecto de Supabase y la columna `tool` las separa.
 */

/** Nombre de la herramienta en todas las tablas (y en tool_users al registrarse). */
export const TOOL_NAME = process.env.SUPABASE_TOOL_NAME || 'herramienta de transparencia'

/** Correo genérico para `tool_feedback`, donde `email` es obligatorio. */
export const ANONIMO = 'anonimo@goblab.cl'

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  return {
    url,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
  }
}

/**
 * Id del usuario en tool_users para ese correo, o null si no está registrado.
 * Solo existe fila si la persona aceptó recibir novedades al ingresar, así que
 * sirve a la vez para saber si dio su consentimiento para conservar el correo
 * y para el vínculo (FK user_id).
 *
 * Usa la función `eia_user_id(p_email, p_tool)` del Supabase compartido
 * (migración 004 del repo de la EIA), que filtra por herramienta y devuelve solo
 * el id, sin que la anon key pueda leer tool_users. Si falla, devuelve null:
 * ante la duda, el correo no se guarda.
 */
export async function resolveUserId(email: unknown): Promise<string | null> {
  const cfg = supabaseConfig()
  if (!cfg || typeof email !== 'string' || !email.includes('@')) return null
  try {
    const res = await fetch(`${cfg.url}/rest/v1/rpc/eia_user_id`, {
      method: 'POST',
      headers: { ...cfg.headers, Prefer: 'return=representation' },
      body: JSON.stringify({ p_email: email, p_tool: TOOL_NAME }),
    })
    if (!res.ok) return null
    const id: unknown = await res.json()
    return typeof id === 'string' && id ? id : null
  } catch {
    return null
  }
}

/**
 * Inserta probando primero con las columnas nuevas y, si fallan (migración sin
 * correr), con las siguientes variantes más simples. Nunca se pierde un envío
 * por una columna que todavía no existe.
 */
export async function insertarConRespaldo(tabla: string, variantes: object[]): Promise<Response> {
  const cfg = supabaseConfig()
  if (!cfg) throw new Error('Configuración de base de datos incompleta')
  let res: Response | null = null
  for (let i = 0; i < variantes.length; i++) {
    const fila = variantes[i]
    res = await fetch(`${cfg.url}/rest/v1/${tabla}`, {
      method: 'POST',
      headers: cfg.headers,
      body: JSON.stringify(fila),
    })
    if (res.ok || i === variantes.length - 1) break
    console.error(`insert en ${tabla} falló (variante ${i + 1}), reintentando:`, res.status, await res.text())
  }
  return res!
}

/** Quita las claves con valor null/undefined para no enviar columnas vacías. */
export function sinNulos<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>
}
