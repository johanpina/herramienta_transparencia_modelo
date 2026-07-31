-- FTA Gen · Hito 1 — la encuesta de satisfacción de la Ficha de Transparencia
-- suma una primera pregunta que la EIA no tiene: el nombre de la institución.
--
-- `tool_survey` es compartida por las dos herramientas, así que la columna se
-- agrega y queda nula para las respuestas de la EIA.
--
-- Ejecutar en el SQL Editor de Supabase. Es idempotente.

alter table public.tool_survey add column if not exists p1_institucion text;

comment on column public.tool_survey.p1_institucion is
  'Institución que declara quien responde (sólo Ficha de Transparencia, desde v5.0.0).';

-- Nota sobre p7_recomendaciones: en la EIA mide la claridad de las recomendaciones
-- y en la Ficha de Transparencia mide si el PDF representa fielmente el proyecto.
-- Misma escala 1-7, distinto enunciado: filtrar por `tool` antes de promediar.
comment on column public.tool_survey.p7_recomendaciones is
  'Escala 1-7. EIA: claridad de las recomendaciones. FT: fidelidad del PDF generado. Filtrar por `tool` antes de agregar.';
