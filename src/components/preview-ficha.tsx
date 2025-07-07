import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { PdfExportButton } from '@/components/PdfExportButton'
import Image from 'next/image'

interface PreviewFichaProps {
  formData: Record<string, any>
  onClose: () => void
  //onGeneratePDF: () => void
  isPdfGeneration?: boolean
}


export function PreviewFicha({ formData, onClose, isPdfGeneration = false }: PreviewFichaProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const elaborationDate = format(currentDate, 'dd/MM/yyyy')
  const version = process.env.NEXT_PUBLIC_VERSION  || '0.0.0' // versión de la app

  useEffect(() => {
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');
    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        setImagesLoaded(true);
      }
    };

    img1.onload = checkAllLoaded;
    img2.onload = checkAllLoaded;

    img1.src = "/images/Logo_herramientas_algoritmos.png";
    img2.src = "/images/logo-goblab-uai.png";
  }, []);

  const renderSection = (title: string, content: React.ReactNode, showCondition: boolean = true) => {
    if (!content || !showCondition) return null;
    return (
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {content}
      </section>
    );
  };

  return (

    <div className={`fixed inset-0 bg-white z-50 overflow-auto p-8 ${isPdfGeneration ? 'hidden' : ''}`}>

      <div
        id="ficha-preview"                       // 🔑 lo usará el botón
        className="ficha-content max-w-4xl mx-auto break-anywhere "
      >
        <div className="print-header block justify-between items-center mb-6 ">
          <div className="flex justify-between items-center p-4 rounded-lg backdrop-blur-sm gap-4">
            {/* Elemento Izquierdo */}
            <div className="flex items-center space-x-2">
              <img
                src="/images/logo-goblab-uai.png"
                alt="Gob_Lab UAI"
                width={260} // Ajusta el tamaño de la imagen según sea necesario
                height={100}
              />
            </div>
            {/* Elemento Central */}
            <h1 className="text-2xl font-bold text-center flex-1 flex-grow min-w-[200px]">Ficha de transparencia del modelo</h1>

            {/* Elemento Derecho */}
            <div className="flex items-center space-x-2">
              <img
                src="/images/herramientas.png"
                alt="HERRAMIENTAS ALGORITMOS ÉTICOS"
                width={280} // Ajusta el tamaño de la imagen según sea necesario
                height={100}
              />
            </div>

            
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center ">{formData.nombreModelo1 || 'Ficha de Transparencia'}</h2>
        </div>
        
        <div className="gap-8 text-sm text-justify columns-1 md:columns-2 print:columns-2 px-6 py-4">

          {renderSection('Visión general del Sistema de decisiones automatizado (SDA)', (
            <>
            {formData.propositoModelo3 || 'No se proporcionó descripción'}
            <ul className="list-disc list-inside mb-4 break-anywhere"> 
              
              {formData.porqueModeloTA4 && <li><p className='mb-2 inline font-bold'>Razones de usar el SDA para tomar decisiones:</p> {formData.porqueModeloTA4}</li>}
              {formData.alcanzarResultadosTA5 && <li><p className='mb-2 inline font-bold'>Forma en la que el SDA obtiene resultados:</p> {formData.alcanzarResultadosTA5}</li>}
              <li><p className='mb-2 inline font-bold'>Uso previsto del SDA:</p> {formData.usoPrevistoModelo6 || 'No especificado'}</li>
              <li><p className='mb-2 inline font-bold'>Resultado que puede esperar el usuario directo del SDA:</p> {formData.usoPrevistoModelo6y1 || 'No especificado'}</li>
              {formData.usosNocontextModelo7 && <li><p className='mb-2 inline font-bold'>Usos fuera del alcance del SDA:</p> {formData.usosNocontextModelo7}</li>}
            </ul>
            </>))
          }

          {renderSection('Detalles del SDA', (
            <>
            <ul className="list-disc list-inside mb-4 break-anywhere">
              <li><p className='mb-2 inline font-bold'>SDA desarrollado por:</p> <strong>{formData.desarrolladorModelo8 || 'No se especifica desarrollador del SDA'}</strong></li>
              <li><strong> Versión del SDA: {formData.versionModelo9 || 'No especificada'}</strong></li>
              <li><strong>Fecha de implementación:</strong> {formData.fechaModelo10 ? format(new Date(formData.fechaModelo10), 'dd/MM/yyyy') : 'No especificada'}</li>
              <li>{formData.tipoModelo2 || 'Tipo de SDA '}</li>
              {formData.linkModelo11 && <li><strong>Enlace: </strong>{formData.linkModelo11}</li>}
              {formData.citaModelo12 && <li><strong>Cómo citar:</strong> {formData.citaModelo12}</li>}
              {formData.licenciaModelo13 && <li><strong>Licencia del SDA:</strong> {formData.licenciaModelo13}</li>}
              
            </ul>
            </>))
          }

          {renderSection('Categorización o elaboración de perfiles', (
            <>
            <li><strong>Categorías del SDA:</strong> {formData.classModelocategoriasTA16 || 'No especificado'}</li>
            {formData.classModelometodologiaTA16y1 && <li><strong>Motivo o fundamento por el que las categorias son relevantes: </strong> {formData.classModelometodologiaTA16y1}</li>}
            {formData.classModelometodologiaTA16y2 && <li><strong>Metodología utilizada por el SDA: </strong> {formData.classModelometodologiaTA16y2}</li>}
            {formData.classModelometodologiaTA16y3 && <li><strong>Efecto de las variables en la categorización: </strong> {formData.classModelometodologiaTA16y3}</li>}
            
            {formData.classModelometodologiaTA17 && <li><strong>Consecuencias previstas en el titular de los datos:</strong> {formData.classModelometodologiaTA17}</li>}
            {formData.classModelometodologiaTA19 && <li><strong>Importancia de categorizar: </strong> {formData.classModelometodologiaTA19}</li>}
                        
            </>
          ),formData.classModeloTA15 === 'Sí')}

          {renderSection('Datos de entrenamiento', (
            <>
            <p className="mb-2">{formData.datosModelo23 || 'No se especificaron'}</p>
            <p className="mb-2"><strong>Preprocesamiento de los datos:</strong> {formData.ProcesamientoModelo24 || 'No se especificaron'}</p>
            {formData.ProcesamientoModelo24y1 && <p className="mb-2"><strong>Justificación del uso de los datos:</strong> {formData.ProcesamientoModelo24y1}</p>}
            </>
          ))}

          {renderSection('Datos de evaluación', (
            <>
            <p className="mb-2">{formData.conjuntosEvalModelo25 || 'No se especificaron'}</p>
            <p className="mb-2"><strong>Preprocesamiento de los datos para evaluación: </strong>{formData.preprocesamientoEvaluacionModelo27 || 'No se especificaron'}</p>
            </>
          ))}

          {renderSection('Métricas de desempeño', (
            <>
            <p className="mb-2">{formData.metricasModelo20 || 'No se especificaron métricas'}</p>
            <ul className="list-disc list-inside">
              <li><strong>Umbral de decisión:</strong> {formData.umbralDecisionModelo21 || 'No especificado'}</li>
              <li><strong>Resultado del SDA por cada métrica:</strong> {formData.umbralDecisionModelo21y1 || 'No especificado'}</li>
            </ul>
            {formData.caluloMedicionesModelos22 && <p><strong>Elección de métricas:</strong> {formData.calculo_mediciones_modelo}</p>}
            </>
          ))}


          {renderSection('Consideraciones éticas', (
            <>
            <p className="mb-2">El SDA <strong>{formData.modeloCategoriza30 || 'No'}</strong> categoriza las personas</p>
            {formData.razonesdecisionNegativapersonas31 && (
              <p className="mb-2"><strong>Circunstancias de decisión negativa:</strong> {formData.razonesdecisionNegativapersonas31}</p>
            )}
            <p className="mb-2">El SDA <strong>{formData.datosPersonalesTA32 || 'No'}</strong> usa datos personales</p>
            {formData.cualesdatosPersonales321 && (
              <p className="mb-2"><strong>Datos personales utilizados:</strong> {formData.cualesdatosPersonales321}</p>
            )}
            <p className="mb-2">El SDA <strong>{formData.datoSensible33 || 'No'}</strong> usa datos sensibles</p>
            {formData.tipoDatoSensible331 && (
              <p className="mb-2"><strong>Datos sensibles utilizados:</strong> {formData.tipoDatoSensible331}</p>
            )}
            <p className="mb-2">El SDA <strong>{formData.asuntosCentralesModelo34 || 'No'}</strong> toma decisiones importantes para la vida</p>
            {formData.tipoAsuntosCentralesModelo341 && (
              <p className="mb-2"><strong>Asuntos centrales para la vida:</strong> {formData.tipoAsuntosCentralesModelo341}</p>
            )}
            {formData.riesgoUsoModelo36 && (
              <p className="mb-2"><strong>Riesgos del SDA:</strong> {formData.riesgoUsoModelo36}</p>
            )}
            {formData.casosUsoconocidos37 && (
              <p className="mb-2"><strong>Casos de uso problemáticos:</strong> {formData.casosUsoconocidos37}</p>
            )}
            {formData.estrategiasMitigacionModelo35 && (
              <p className="mb-2"><strong>Estrategias de mitigación de riesgos:</strong> {formData.estrategiasMitigacionModelo35}</p>
            )}
            {formData.otraConsideracion38 && (
              <p><strong>Casos de uso problemáticos:</strong> {formData.otraConsideracion38}</p>
            )}
            </>
          ))}
          
          {renderSection('Advertencias y Recomendaciones', (
            <>
            {formData.pruebaAdicional39 && <p className="mb-2"><strong>Pruebas adicionales:</strong> {formData.pruebaAdicional39}</p>}
            <p className="mb-2"><strong>{formData.grupoRelevante40 || 'No'}</strong> hay grupos relevantes NO representados en el conjunto de datos.</p>
            {formData.recomendacionesAdicionales41 && (
              <p className="mb-2"><strong>Recomendaciones adicionales:</strong> {formData.recomendacionesAdicionales41}</p>
            )}
            {formData.caracteristicasIdeales42 && (
              <p><strong>Características ideales del conjunto de datos:</strong> {formData.caracteristicasIdeales42}</p>
            )}
            </>
          ))}

          {renderSection('Reclamaciones', (
            <>
            <p className="mb-2">El SDA <strong>{formData.reclamacionTA43 || 'No'}</strong> tiene una vía para realizar reclamaciones.</p>
            {formData.viaReclamacionTA44 && <p><strong>Vía de reclamación: </strong>{formData.viaReclamacionTA44}</p>}
            </>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm text-justify">
          <h3 className="font-semibold text-center">Exención de responsabilidad</h3>
          <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
              <p className="break-words overflow-wrap">
                La ficha de transparencia es una herramienta desarrollada para apoyar la transparencia en la implementación de modelos de ciencia de datos e inteligencia artificial (IA). La ficha está diseñada únicamente como un soporte para quienes buscan entregar mayor información a sus usuarios o al público sobre el desarrollo de sus modelos, con el fin de fomentar la explicabilidad de las decisiones que utilizan IA o ciencia de datos. Esta es una herramienta de referencia, que debe ser completada con la información requerida por los encargados de las instituciones que la utilizarán.
              </p>
              <p className="break-words overflow-wrap">
                La Universidad Adolfo Ibáñez (UAI) no ofrece garantías sobre el funcionamiento o el desempeño de los sistemas de ciencia de datos e IA que utilicen esta ficha. La Universidad no es responsable de ningún tipo de daño directo, indirecto, incidental, especial o consecuente, ni de pérdidas de beneficios que puedan surgir directa o indirectamente de la aplicación de la ficha en el uso o la confianza en los resultados obtenidos a través de esta herramienta.
              </p>
              <p className="break-words overflow-wrap">
                El empleo de las herramientas desarrolladas por la Universidad no implica ni constituye un sello ni certificado de aprobación por parte de la Universidad Adolfo Ibáñez respecto al cumplimiento legal, ético o funcional de un algoritmo de inteligencia artificial. La Universidad Adolfo Ibáñez no se hace responsable de la implementación de los algoritmos de inteligencia artificial que utilicen esta ficha, ni de las decisiones que se tomen en base a la información proporcionada por la misma.               
              </p>
            </div>

        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 no-print">
          <p>Herramienta del GobLab UAI - Licencia  MPL-2.0. - Version V.{version}</p>
          <p>© {year} Ficha de transparencia del modelo elaborada en {elaborationDate}. </p>
        </footer>
        
      </div>
      
      {/* El botón de exportación lo añadimos desde la página padre */}
      {!isPdfGeneration && (
         <div className="print:hidden flex justify-between mt-8 max-w-4xl mx-auto">
           <Button onClick={onClose} variant="outline">Volver</Button>

           {/* <-- NUEVO botón de descarga --> */}
           <PdfExportButton
             targetId="ficha-preview"          // <-- debe coincidir con el id del contenedor
             fileName="ficha de transparencia del modelo.pdf"
           />
         </div>
      )}
    </div>
  )
}

