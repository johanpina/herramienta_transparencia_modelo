# FTA Gen · Hito 1 — plan de ajuste

Fuente: `FTA Gen (Hito1) Contenido/Desarrollo` (Drive) → extraído a
[`contenido-hito1.json`](contenido-hito1.json) con el script de la sesión.

Estado de partida: **v4.0.0** en producción; en local ya está aplicado el rediseño
Civic Rose + backend Supabase (feedback, encuesta, registro), sin cambios de contenido.

---

## 1. Magnitud del cambio

| | Hoy (v4.0.0) | Hito 1 |
|---|---|---|
| Secciones | 9 | **12** |
| Preguntas | 48 | **112** |
| Preguntas nuevas | — | **71** (63 % del total) |
| Tipos de campo | text, textarea, radio, slider, date | + **multiselect**, + **select largo**, + **bloques** dentro de una sección |
| Condicionales | 1 pregunta = 1 valor | + **AND**, + **"contiene" sobre multiselect**, + **bifurcación IA generativa** |

No es una edición de textos: es un cambio de motor. El componente del cuestionario
soporta hoy un `dependsOn` de un solo nivel y no sabe agrupar preguntas en bloques.

---

## 2. Mapa de secciones

| # | Dimensión | Preg. | Origen |
|---|---|---|---|
| 01 | Visión general | 12 | Existente + absorbe 2 de *Detalles* + 2 nuevas de IA Gen |
| 02 | Detalles del modelo | 5 | Existente, reducida (cede 2 a *Visión*), + *link de código* |
| 03 | Clasificación | 7 | Existente (*Categorización o elaboración de perfiles*) |
| 04 | **Legal** | **35** | **NUEVA** — absorbe datos personales/sensibles de *Consideraciones éticas* |
| 05 | **Ciberseguridad** | **21** | **NUEVA** |
| 06 | **Propiedad intelectual** | **10** | **NUEVA** |
| 07 | Consideraciones éticas | 4 | Existente, reducida de 12 → 4 (8 se van a *Legal*) |
| 08 | Métricas de rendimiento | 4 | Existente, sin cambios |
| 09 | Datos de entrenamiento | 3 | Existente, sin cambios |
| 10 | Datos de evaluación | 2 | Existente, sin cambios |
| 11 | Advertencias y recomendaciones | 4 | Existente, sin cambios |
| 12 | Reclamación | 5 | Existente (2) + 3 que vienen de *Legal* |

`Legal` trae 8 bloques internos: Datos personales · Datos sensibles · Decisiones
automatizadas con efectos jurídicos · Base de licitud (consentimiento) · Base de
licitud (ley) · Procedimiento y evaluación de riesgo · Salvaguardas generales ·
Deber de información y transparencia.

---

## 3. Lo que hay que construir

### 3.1 Motor de preguntas (`src/data/sections.ts` + `transparency-tool.tsx`)

- **`bloque?: string`** en `Question`, para los subtítulos dentro de *Legal*.
  Sin esto, 35 preguntas seguidas son ilegibles.
- **`type: 'multiselect'`** — casillas para las listas A/B/C… (causales habilitantes,
  art. 14 ter). Guarda `string[]`.
- **`type: 'select'`** — alternativas largas de selección única (base de licitud).
  Un radio con textos de 3 líneas no funciona visualmente.
- **`dependsOn` extendido** — hoy `{questionId, value}`. Necesita:
  - `all: [...]` para el AND (`4.6 = Sí Y se marcó F en 4.8`),
  - operador `includes` para preguntar sobre un multiselect,
  - marca `iaGen` para las preguntas que solo aplican si el SDA usa IA generativa
    (mismo patrón que la EIA).
- **Progreso y obligatorias**: la lógica ya ignora preguntas ocultas; hay que
  extenderla a los tipos nuevos (un multiselect vacío no cuenta como respondido).

### 3.2 Documento / PDF (`preview-ficha.tsx`)

Hoy el PDF lista campo por campo, a mano. Con 112 preguntas eso no se sostiene y es
justo el mecanismo que ya produjo respuestas perdidas (los IDs desalineados que
corregimos). **Hay que generarlo desde `sections.ts`**: recorrer dimensiones y
preguntas visibles con respuesta, y componer el documento. Se conserva el estilo
Civic Rose ya hecho; cambia sólo de dónde saca el contenido.

Efecto secundario bueno: los cambios de preguntas futuros ya no obligan a tocar el PDF.

### 3.3 Encuesta de satisfacción

La hoja `Encuesta facilidad de uso` es casi la de la EIA, con dos diferencias:

- **P1 nueva**: *Nombre de la institución pública a la que pertenece o representa*
  (texto abierto, obligatoria). **`tool_survey` no tiene columna para esto** → migración
  `alter table tool_survey add column if not exists p1_institucion text`.
- **P7 cambia de tema**: en la EIA pregunta por las recomendaciones; aquí pregunta si
  *el PDF generado representa fielmente el proyecto*. Misma columna
  (`p7_recomendaciones`), distinto enunciado — conviene renombrarla o documentarlo.

El resto (escalas 1-7, sí/no, texto abierto, contacto) ya está implementado y probado.

---

## 4. Orden de trabajo

| Fase | Qué | Estado |
|---|---|---|
| 1 | Modelo de datos: `bloque`, `multiselect`, `select`, `dependsOn` compuesto | ✅ `src/data/question-types.ts` |
| 2 | Render de los tipos nuevos + subtítulos de bloque | ✅ `transparency-tool.tsx` |
| 3 | Cargar las 12 dimensiones / 112 preguntas | ✅ `sections.ts`, generado |
| 4 | Cablear las condicionales | ⚠️ 53 cableadas; las dudosas con `TODO(consulta-N)` |
| 5 | PDF generado desde `sections.ts` | ✅ `preview-ficha.tsx` |
| 6 | Encuesta: P1 institución + migración + P7 | ✅ código; falta correr la migración 002 |
| 7 | Recorrido completo + verificación en Supabase | ⏳ tras resolver las consultas |

### Decisiones tomadas al implementar

- **Numeración**: cada dimensión se renumera por posición → `D.N`. Es lo único que hace
  consistentes todas las referencias cruzadas del documento salvo dos (consultas 6 y 6 bis).
- **Identificadores**: `d04_q12`. Estables e independientes de la numeración visible, que
  cambia cada vez que se agrega o quita una pregunta. El número visible va aparte, en
  `numero`, y es el que viaja en el feedback.
- **Alternativas largas** (causales legales, art. 14 ter) se muestran como lista vertical
  de tarjetas, no como `<select>` nativo: los textos de varias líneas quedan truncados.
- **Preguntas sí/no sin fila `Option`** en el Excel se infieren de las condicionales que
  las evalúan (consulta 12).
- **Fichas de la v4**: se descartan en silencio. Los identificadores cambiaron por
  completo, así que las respuestas viejas quedan en `localStorage` pero ninguna pregunta
  las lee; el cuestionario abre vacío.
- **Dimensiones sin responder no entran al PDF**: una ficha donde no aplicaba
  ciberseguridad no muestra la sección vacía.

---

## 5. Ambigüedades del documento a resolver antes de la fase 4

1. **Numeración inconsistente en D4.** Empieza en `1.4, 3.4, 4.4…` (n.dimensión) y a
   partir de `4.13` cambia a `dimensión.n`. Las referencias cruzadas ("Si 4.10 = Sí",
   "saltar a 4.13") usan la segunda forma. Hay que fijar una sola numeración.
2. **D4 · 4.33** está condicionada a *"Si 4.35 = Sí"*, pero 4.35 viene **después**.
   Probablemente debía decir 4.32.
3. **D4 · 4.8** — la lista de causales tiene **la letra F repetida** ("Autorizado o
   mandatado expresamente por la ley" y "Porque una ley lo ordena o lo permite"), con
   ejemplos mezclados dentro del enunciado. Hay que dejar una sola lista limpia.
4. **D6 · 1.6** dice *"condicional: cuando 5.2 es SÍ"* — 5.2 es una pregunta de
   **ciberseguridad**. Propiedad intelectual no debería depender de eso; parece copiado
   de la hoja anterior. ¿Es incondicional?
5. **D5 completa** cuelga de `5.2` (*operador de importancia vital*), que a su vez
   cuelga de `5.1`. Es decir: si el organismo no es servicio esencial, **toda la
   dimensión de ciberseguridad desaparece**. ¿Es la intención?
6. **D5 · IDs** saltan de `12.5` a `5.13 … 5.21` (cambia el criterio a mitad de hoja).
7. **D7** está marcada *"Se mantiene"*, pero las 8 preguntas de datos personales y
   sensibles que hoy viven ahí se mueven a *Legal*. Hay que confirmar que se
   **eliminan** de Consideraciones éticas (no que se dupliquen).
8. **D3 · 7.3** (*¿Por qué la categoría, perfil o prioridad es relevante…?*) es
   prácticamente la misma pregunta que **3.3** (*Indique el motivo o fundamento en
   virtud de los que la categoría es relevante…*). ¿Se elimina una?
9. **18 preguntas nuevas no traen tooltip** y varias tampoco placeholder — entre ellas
   las dos nuevas de D1 (proveedor/desarrollo propio, uso general/específico) y el
   *link de acceso al código* de D2.
10. **D2 · link de código** está marcada obligatoria, pero sólo tiene sentido si la
    licencia es open source. ¿Debe ser condicional?
11. **Marcador `IAGen`** aparece como "condición para el usuario" en D4 · 3.4. ¿Habrá
    una pregunta filtro de IA generativa que active ese subconjunto, como en la EIA?

---

## 6. Versión

El repo no usa tags; la versión vive en `NEXT_PUBLIC_VERSION` (Vercel) y se muestra en
la portada. Producción está en **4.0.0**.

Criterio propuesto, en paralelo a la EIA (que pasó de 4.1.1 a **5.0.0** al entrar
*EIA Gen · Hito 1*):

- **4.1.0** — rediseño Civic Rose + feedback/encuesta en Supabase. Misma ficha, misma
  numeración de preguntas: nadie que la haya llenado pierde nada. Es la etiqueta
  correcta si se decide desplegar el rediseño antes que el contenido.
- **5.0.0 · «FTA Gen»** — este Hito 1. Cambia el número y el orden de las secciones, así
  que las respuestas guardadas en `localStorage` de la versión anterior **dejan de
  corresponder**: es un cambio mayor por definición.

Recomendación: si todo sale junto, publicar directamente **5.0.0** y dejar 4.1.0 sólo
como etiqueta de los commits del rediseño.

> Nota de migración: al cambiar los `id` de las preguntas, una ficha a medio llenar de
> la v4 se abrirá vacía en la v5. Conviene decidir si se descarta en silencio o se avisa.
