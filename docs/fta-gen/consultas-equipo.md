# FTA Gen · Hito 1 — consultas al equipo de contenido

Preguntas que surgieron al pasar el documento
`FTA Gen (Hito1) Contenido/Desarrollo` a la herramienta. Cada una indica la hoja y el
ID de la pregunta afectada, y una propuesta para que baste con confirmar o corregir.

Mientras no haya respuesta, la implementación queda marcada con `TODO(consulta-N)` en
`src/data/sections.ts`.

---

## Bloqueantes — cambian qué ve el usuario

### Consulta 1 · Ciberseguridad: ¿la dimensión completa es condicional?
**Hoja `D5_Cyberseguridad`, preguntas 3.5 en adelante (19 de 21).**

Todas dicen *"condicional: cuando 5.2 es SÍ esta se abre"*. Y `5.2` (*¿es operador de
importancia vital según ANCI?*) a su vez cuelga de `5.1` (*¿es servicio esencial?*).

Leído literalmente: **una institución que no sea operador de importancia vital no
responde ninguna pregunta de ciberseguridad** — la dimensión aparece con dos preguntas
y se cierra.

> ¿Es la intención? Alternativas: (a) sí, tal cual; (b) sólo un subconjunto cuelga de
> 5.2 y el resto aplica siempre; (c) cuelgan de 5.1, no de 5.2.

### Consulta 2 · Propiedad intelectual: ¿condición heredada por error?
**Hoja `D6_Propiedad Intelectual`, pregunta 1.6.**

Dice *"condicional: cuando 5.2 es SÍ esta se abre"* — pero `5.2` es una pregunta de
**ciberseguridad**. La siguiente (`2.6`) sí usa la forma correcta (*"cuando 6.1 es SÍ"*).

> Se ve como copiado de la hoja anterior. ¿Confirmamos que **1.6 es incondicional** y
> abre la dimensión?

### Consulta 3 · Consideraciones éticas: ¿se eliminan las preguntas que se fueron a Legal?
**Hojas `D7_Consideraciones éticas` y `D4_LegaL`.**

D7 quedó con 4 preguntas, todas marcadas *"Se mantiene"*. Pero la versión actual de la
herramienta tiene **12** en esa sección: las 8 restantes son las de datos personales,
datos sensibles y decisiones sobre asuntos centrales, que en D4 aparecen marcadas
*"Nueva hito 1 - viene de la de ética"*.

> ¿Confirmamos que esas 8 **se eliminan** de Consideraciones éticas y quedan sólo en
> Legal? (Si no, quedarían duplicadas en la ficha.)

### Consulta 4 · ¿Hay una pregunta filtro de IA generativa?
**Hoja `D4_LegaL`, pregunta 3.4** — su condición dice `IAGen`.

En la EIA existe una pregunta que activa todo el subconjunto de IA generativa. Aquí
aparece el marcador pero no la pregunta que lo enciende.

> ¿Se agrega una pregunta tipo *"¿El SDA incorpora componentes de IA generativa?"*, y en
> qué dimensión? ¿Qué otras preguntas dependen de ella? (`D5 · 12.5` menciona
> "componente generativo" y `D6` habla de entrenamiento y RAG.)

---

## Numeración y referencias cruzadas

### Consulta 5 · D4 numera de dos formas distintas
**Hoja `D4_LegaL`.**

Arranca con `1.4, 3.4, 4.4, 5.4 …` (**orden.dimensión**) y desde la fila 34 pasa a
`4.13, 4.14, … 4.35` (**dimensión.orden**). Las referencias cruzadas ("Si 4.10 = Sí",
"saltar a 4.13") usan la segunda forma, lo que hace ambiguo a qué apunta cada condición.

> Propuesta: adoptar **dimensión.orden** (`4.1 … 4.35`) para toda la hoja y reescribir las
> condiciones con esa numeración. ¿Confirman?

### Consulta 6 · D4 · 4.33 apunta a una pregunta posterior
**Hoja `D4_LegaL`, pregunta 4.33** (*¿Se entrega información significativa sobre la
lógica aplicada…?*), condición: *"Si 4.35 = Sí"*.

Pero `4.35` es la **última** de la hoja (deber de información, art. 14 ter) y no es una
pregunta sí/no.

> ¿Debía decir **4.32** (*¿Se provee al titular, antes de la decisión, información de que
> existe una decisión automatizada?*), que sí es sí/no y precede a 4.33?

### Consulta 6 bis · D4 · 4.8 parece colgar de la pregunta equivocada
**Hoja `D4_LegaL`, pregunta 4.8** — *Si no hay consentimiento expreso para el
tratamiento de datos sensibles, seleccione la(s) causal(es) habilitante(s)…*,
condición: **"Si 4.6 = No"**.

Renumerando la hoja por posición (consulta 5), `4.6` es *¿Alguno de los datos sensibles
corresponde a datos de salud?* y `4.7` es *¿El titular entregó su consentimiento en
forma expresa?*. El enunciado de 4.8 habla de la **ausencia de consentimiento**, no de
datos de salud.

Refuerza la lectura que la pregunta siguiente (`4.9`) diga *"Si 4.6 = Sí Y se marcó F en
4.8"* junto a un enunciado que empieza con *"Si el dato sensible es de salud…"* — ahí
`4.6` **sí** es la de datos de salud, y calza.

> ¿Debía decir **"Si 4.7 = No"** en 4.8?

### Consulta 7 · D5 cambia el criterio de numeración a mitad de hoja
**Hoja `D5_Cyberseguridad`.**

Va `1.5 … 12.5` y después salta a `5.13, 5.14 … 5.21`.

> Mismo criterio que la consulta 5: unificar como `5.1 … 5.21`.

---

## Contenido de las preguntas

### Consulta 8 · D4 · 4.8: la lista de causales tiene la letra F repetida
**Hoja `D4_LegaL`, pregunta 4.8** (causales habilitantes para datos sensibles).

La lista trae **dos alternativas F**:

- *F. Autorizado o mandatado expresamente por la ley.*
- *F. Porque una ley lo ordena o lo permite*

Y ambas vienen con ejemplos (`Ej: …`) mezclados dentro del texto de la alternativa,
mientras que A–E no los tienen.

> Necesitamos **una lista limpia**: letras únicas, y los ejemplos separados del enunciado
> (pueden ir al tooltip de la pregunta).

### Consulta 9 · D3 · 3.3 y 7.3 preguntan casi lo mismo
**Hoja `D3_Clasificación`.**

- `3.3` — *Indique el motivo o fundamento en virtud de los que la categoría es relevante
  para que el SDA alcance sus resultados.*
- `7.3` — *¿Por qué la categoría, perfil o prioridad es relevante para que el modelo
  alcance sus resultados?*

`7.3` además viene sin tooltip ni placeholder (ambos son `-`).

> ¿Se elimina `7.3`?

### Consulta 10 · D2 · link del código: ¿obligatorio o condicional?
**Hoja `D2_Detalles del modelo`, pregunta 5.2** — *Link de acceso de código (en caso de
ser open source)*, marcada **(*) Obligatoria**.

El propio enunciado dice "en caso de ser open source", así que como obligatoria bloquea
la descarga de la ficha a cualquier institución con software propietario.

> Propuesta: hacerla **condicional** a la pregunta de licencia, u opcional. ¿Cuál prefieren?

### Consulta 11 · 18 preguntas nuevas sin tooltip (y varias sin placeholder)

Entre ellas, las más visibles:

| Hoja | ID | Pregunta | Falta |
|---|---|---|---|
| D1 | 10.1 | ¿El sistema utilizado es de proveedor o desarrollo propio? | tooltip + placeholder |
| D1 | 11.1 | ¿El sistema es de uso general o tiene un propósito específico? | tooltip + placeholder |
| D2 | 2.2 | Fecha de implementación del SDA | placeholder |
| D2 | 5.2 | Link de acceso de código | tooltip + placeholder |
| D4 | 4.30 | ¿Se habilita un canal para que el titular aporte información…? | tooltip |
| D12 | 3.12 / 4.12 / 5.12 | Revisión de la decisión, procedimiento, comunicación | tooltip + placeholder |

> El tooltip es lo que hace usable la ficha para equipos no técnicos: es la mayor fuente
> de comentarios en el feedback. ¿Los completan, o los redactamos nosotros y los revisan?

### Consulta 12 · Preguntas sí/no sin fila `Option`

Cuatro preguntas están redactadas como sí/no y otras dependen de su respuesta, pero el
Excel no les puso la fila `Option`:

| Hoja | ID | Pregunta | Quién depende de ella |
|---|---|---|---|
| D4 | 4.4 | ¿El sistema (SDA) utiliza datos sensibles? | 4.5, 4.6, 4.7 |
| D4 | 4.30 | ¿Se habilita un canal para que el titular aporte información…? | 4.31 |
| D4 | 4.32 | ¿Se provee al titular, antes de la decisión, información…? | 4.33 |
| D12 | 12.3 | ¿Puede el titular solicitar revisión de la decisión? | 12.4, 12.5 |

Se implementaron como **sí/no**: si quedaran como texto libre, la condicional nunca se
cumpliría — nadie escribe exactamente "Sí" en un campo abierto.

> ¿Se confirma? Y de paso: `4.34` (*¿Se mantienen publicaciones públicas de políticas de
> tratamiento…?*) también parece sí/no, pero nada depende de ella, así que quedó como
> texto libre.

---

## Anexo · una observación que no es del Hito 1

`D11 · 2.11` (*¿Existe algún grupo relevante que no está representado…?*) tiene como
tooltip *"Indique el estado actual del cumplimiento normativo del proyecto"*, que no
corresponde a la pregunta. **Ya está así en la versión en producción**, no lo introduce
el Hito 1. ¿Lo corregimos de paso?
