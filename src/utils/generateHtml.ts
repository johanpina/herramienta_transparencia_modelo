import { format } from 'date-fns';

function prepareSectionHtml(key: string, value: string | null | undefined, prefix: string = "", suffix: string = ""): string {
  if (value) {
    return `${prefix}<strong>${key}:</strong> ${value}${suffix}`;
  }
  return "";
}

export function generateHtml(formData: Record<string, any>): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const elaborationDate = format(currentDate, 'dd/MM/yyyy');

  const renderSection = (title: string, content: string) => {
    if (!content) return '';
    return `
      <section>
        <h3>${title}</h3>
        ${content}
      </section>
    `;
  };

  console.log(formData);  // Debugging
  // imprimir en terminal los datos que se están recibiendo y ver como acceder a las llaves del objeto
  //console.log(formData.nombreModelo1);  // Debugging


  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ficha de Transparencia</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #eaeaea;
    }
    .container {
      max-width: 800px;
      margin: auto;
      background-color: #fff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .column-container {
      column-count: 2;
      column-gap: 40px;
    }
    h1 {
      color: #20c997;
      font-size: 22px;
      text-align: center;
      margin-bottom: 24px;
      column-span: all;
    }
    h2, h3 {
      color: #20c997;
    }
    p, ul, li {
      font-size: 14px;
      color: #333;
      line-height: 1.6;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      margin-top: 20px;
      color: #666;
    }
    @media screen and (max-width: 768px) {
      .column-container {
        column-count: 1;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${formData.nombreModelo1 || 'Ficha de Transparencia'}</h1>
    <div class="column-container break-anywhere">
      ${renderSection("Detalles del Modelo", `
        ${prepareSectionHtml("Modelo desarrollado por ", formData.desarrollador_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Versión del modelo", formData.version_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Fecha de implementación", formData.fechaImplementacion ? format(new Date(formData.fechaImplementacion), 'dd/MM/yyyy') : '', "<p>", "</p>")}
        ${prepareSectionHtml("Tipo de modelo", formData.tipo_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Enlace", formData.link_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("¿Cómo citar?", formData.cita_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Licencia del modelo", formData.licencia_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Contacto", formData.contacto_modelo, "<p>", "</p>")}
      `)}

      ${renderSection("Visión general del modelo", `
        <p>${formData.descripcionProyecto || 'No se proporcionó descripción'}</p>
        ${prepareSectionHtml("Razones de usar el modelo", formData.razonesAutomatizacion, "<p>", "</p>")}
        ${prepareSectionHtml("Forma en la que el modelo obtiene resultados", formData.objetivosPrincipales, "<p>", "</p>")}
        ${prepareSectionHtml("Uso previsto del modelo", formData.UsoPrevisto_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Usos fuera del alcance del modelo", formData.UsosNocontext_modelo, "<p>", "</p>")}
      `)}

      ${renderSection("Métricas de rendimiento", `
        <p>${formData.metricas_modelo || 'No se especificaron métricas'}</p>
        ${prepareSectionHtml("Umbral de decisión", formData.nivelImpacto, "<p>", "</p>")}
        ${prepareSectionHtml("Forma en la que se estiman las métricas", formData.calculo_mediciones_modelo, "<p>", "</p>")}
      `)}

      ${renderSection("Datos de Entrenamiento", `
        <p>${formData.datos_modelo || 'No se proporcionó información sobre los datos de entrenamiento'}</p>
        ${prepareSectionHtml("Preprocesamiento de los datos", formData.preprocesamiento_modelo, "<p>", "</p>")}
      `)}

      ${renderSection("Datos de Evaluación", `
        <p>${formData.conjunto_datos_eval_modelo || 'No se proporcionó información sobre los datos de evaluación'}</p>
        ${prepareSectionHtml("Elección de evaluación", formData.eleccion_evaluacion, "<p>", "</p>")}
        ${prepareSectionHtml("Preprocesamiento de los datos para evaluación", formData.preprocesamiento_evaluacion, "<p>", "</p>")}
      `)}

      ${renderSection("Consideraciones Éticas", `
        <p>El modelo ${formData.TA_modelo_categoriza === 'Sí' ? '' : 'no '}categoriza las personas</p>
        ${prepareSectionHtml("Circunstancias de decisión negativa", formData.TA_razones_decision_negativa_personas, "<p>", "</p>")}
        <p>El modelo ${formData.TA_datos_personales === 'Sí' ? '' : 'no '}usa datos personales</p>
        ${prepareSectionHtml("Datos personales utilizados", formData.TA_razones_datos_personales, "<p>", "</p>")}
        <p>El modelo ${formData.dato_sensible === 'Sí' ? '' : 'no '}usa datos sensibles</p>
        ${prepareSectionHtml("Datos sensibles utilizados", formData.dato_sensible_tipo, "<p>", "</p>")}
        <p>El modelo ${formData.asuntos_centrales_modelo === 'Sí' ? '' : 'no '}toma decisiones importantes para la vida</p>
        ${prepareSectionHtml("Asuntos centrales para la vida", formData.asuntos_centrales_tipo, "<p>", "</p>")}
        ${prepareSectionHtml("Estrategias de mitigación de riesgos", formData.estrategias_mitigaciones_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Riesgos del modelo", formData.riesgos_uso_modelo, "<p>", "</p>")}
        ${prepareSectionHtml("Casos de uso problemáticos", formData.casos_uso_conocidos, "<p>", "</p>")}
        ${prepareSectionHtml("Otras consideraciones", formData.otra_consideracion, "<p>", "</p>")}
      `)}

      ${renderSection("Advertencias y Recomendaciones", `
        ${prepareSectionHtml("Pruebas adicionales", formData.prueba_adicional, "<p>", "</p>")}
        <p>${formData.grupo_relevante === 'Sí' ? 'Hay' : 'No hay'} grupos relevantes NO representados en el conjunto de datos.</p>
        ${prepareSectionHtml("Recomendaciones adicionales", formData.recomendaciones_adicionales, "<p>", "</p>")}
        ${prepareSectionHtml("Características ideales del conjunto de datos", formData.caracteristicas_ideales, "<p>", "</p>")}
      `)}

      ${renderSection("Reclamaciones", `
        <p>El modelo ${formData.TA_reclamacion === 'Sí' ? '' : 'no '}tiene una vía para realizar reclamaciones.</p>
        ${prepareSectionHtml("Vía de reclamación", formData.TA_via_reclamacion, "<p>", "</p>")}
      `)}
    </div>
  </div>
  <div class="footer">
    <p>© ${year} Herramienta de transparencia de modelo diseñada por GobLab. Todos los derechos reservados.</p>
    <p>Elaborado en ${elaborationDate}.</p>
  </div>
</body>
</html>
`;

  return html;
}