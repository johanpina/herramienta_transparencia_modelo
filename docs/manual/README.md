# Documentación — Herramienta de Transparencia Algorítmica (GobLab UAI)

Esta carpeta contiene el manual de la herramienta y su material de apoyo.

| Documento | Para quién | Contenido |
|---|---|---|
| **[MANUAL_USUARIO.md](MANUAL_USUARIO.md)** | Equipos que van a elaborar una ficha de transparencia | Guía paso a paso: cómo iniciar, cómo recorrer las 12 dimensiones, por qué aparecen y desaparecen preguntas, cómo completar lo obligatorio y cómo obtener el PDF. Ilustrado con capturas reales de la interfaz. |

## Material de apoyo

- **`img/`** — capturas de pantalla reales de la interfaz, usadas en el manual.
  Se regeneran con el script de capturas (ver abajo).

## Documentación relacionada

Fuera de esta carpeta, en [`../fta-gen/`](../fta-gen/):

| Documento | Contenido |
|---|---|
| `plan-hito1.md` | Plan de trabajo del Hito 1: paso de 9 secciones / 48 preguntas a 12 dimensiones / 112 preguntas |
| `consultas-equipo.md` | Consultas abiertas con el equipo de contenido sobre el documento fuente |
| `contenido-hito1.json` | Transcripción del Excel del Drive, fuente de las preguntas |
| `extraer-excel.py` | Convierte el Excel del Drive a `contenido-hito1.json` |
| `generar-sections.mjs` | Genera `src/data/sections.ts` desde el JSON y valida el grafo de condicionales |

## Regenerar las capturas

Las imágenes se toman de la herramienta corriendo en local, con Chrome manejado
por CDP. Si la interfaz cambia, conviene rehacerlas para que el manual no muestre
pantallas que ya no existen.

```bash
# 1. Levantar la herramienta en local
pnpm dev

# 2. Desde una carpeta con puppeteer-core instalado, correr el script de capturas
node capturar.mjs
```

El script siembra `localStorage` con un caso de ejemplo, recorre las pantallas
—incluidos estados de interacción como la ayuda abierta, el aviso de preguntas
pendientes o la encuesta— y escribe los PNG en `img/`.
