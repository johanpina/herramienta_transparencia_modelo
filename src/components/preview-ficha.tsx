import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface PreviewFichaProps {
  formData: Record<string, any>
  onClose: () => void
  onGeneratePDF: () => void
  isPdfGeneration?: boolean
}


export function PreviewFicha({ formData, onClose, onGeneratePDF, isPdfGeneration = false }: PreviewFichaProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const elaborationDate = format(currentDate, 'dd/MM/yyyy')

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

     
      <div className="ficha-content max-w-4xl mx-auto">
        <div className="block justify-between items-center mb-8">
          <div className="flex justify-between items-center p-4 rounded-lg backdrop-blur-sm">
            {/* Elemento Izquierdo */}
            <div className="flex items-center space-x-2">
              <Image
                src="/images/Logo_herramientas_algoritmos.png"
                alt="HERRAMIENTAS ALGORITMOS ÉTICOS"
                width={280} // Ajusta el tamaño de la imagen según sea necesario
                height={100}
                objectFit='contain'
              
              />
            </div>

            {/* Elemento Central */}
            <h1 className="text-3xl font-bold text-center flex-1 ">Ficha de transparencia</h1>

            {/* Elemento Derecho */}
            <div className="flex items-center space-x-2">
              <Image
                src="/images/logo-goblab-uai.png"
                alt="Gob_Lab UAI"
                width={260} // Ajusta el tamaño de la imagen según sea necesario
                height={100}
                objectFit='contain'
                
              />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center ">{formData.nombreModelo1 || 'Ficha de Transparencia'}</h2>
        <div className="columns-2 gap-8 text-sm">
        
          {renderSection('Detalles del Modelo', (
            <>
            <ul className="list-disc list-inside mb-4">
              <li>Modelo desarrollado por: <strong>{formData.desarrolladorModelo8 || 'No se especifica desarrollador del modelo'}</strong></li>
              <li>Versión del modelo: <strong>{formData.versionModelo9 || 'No especificada'}</strong></li>
              <li>Fecha de implementación: {formData.fechaModelo10 ? format(new Date(formData.fechaModelo10), 'dd/MM/yyyy') : 'No especificada'}</li>
              <li>{formData.tipoModelo2 || 'Tipo de Modelo '}</li>
              {formData.linkModelo11 && <li>Enlace: {formData.linkModelo11}</li>}
              {formData.citaModelo12 && <li>Cómo citar: {formData.citaModelo12}</li>}
              {formData.licenciaModelo13 && <li>Licencia del modelo: {formData.licenciaModelo13}</li>}
              {formData.contactoModelo14 && <li>Contacto: {formData.contactoModelo14}</li>}
            </ul>
            </>))
          }
          
          {renderSection('Visión general del modelo', (
            <>
            <ul className="list-disc list-inside mb-4">
              <li>{formData.propositoModelo3 || 'No se proporcionó descripción'}</li>
              {formData.porqueModeloTA4 && <li>Razones de usar el modelo para tomar decisiones: {formData.porqueModeloTA4}</li>}
              {formData.alcanzarResultadosTA5 && <p className="mb-2">Forma en la que el modelo obtiene resultados: {formData.alcanzarResultadosTA5}</p>}
              <li >Uso previsto del modelo: {formData.usoPrevistoModelo6 || 'No especificado'}</li>
              {formData.usosNocontextModelo7 && <li>Usos fuera del alcance del modelo: {formData.usosNocontextModelo7}</li>}
            </ul>
            </>))
          }

          {renderSection('Modelos de clasificación', (
            <>
            <li >Categorías del modelo: {formData.classModelocategoriasTA16 || 'No especificado'}</li>
            {formData.classModelometodologiaTA17 && <li>Mecanismo utilizado para clasificar datos: {formData.classModelometodologiaTA17}</li>}
            {formData.classModeloefestovariablesTA18 && <li>VEfecto de las variables en la asignación de las categorías: {formData.classModeloefestovariablesTA18}</li>}
            {formData.classModelorelevanciaTA19 && <li>Relevancia de la categoría para el modelo: {formData.classModelorelevanciaTA19}</li>}
            </>
          ),formData.classModeloTA15 === 'Sí')}

          {renderSection('Métricas de rendimiento', (
            <>
            <p className="mb-2">{formData.metricasModelo20 || 'No se especificaron métricas'}</p>
            <ul className="list-disc list-inside">
              <li>Umbral de decisión: {formData.umbralDecisionModelo21 || 'No especificado'}</li>
            </ul>
            {formData.caluloMedicionesModelos22 && <p>Forma en la que se estiman las métricas: {formData.calculo_mediciones_modelo}</p>}
            </>
          ))}
          
          {renderSection('Datos de entrenamiento', (
            <>
            <p className="mb-2">{formData.datosModelo23 || 'No se especificaron'}</p>
            <p className="mb-2">Preprocesamiento de los datos: {formData.ProcesamientoModelo24 || 'No se especificaron'}</p>
            </>
          ))}

          {renderSection('Datos de evaluación', (
            <>
            <p className="mb-2">{formData.conjuntosEvalModelo25 || 'No se especificaron'}</p>
            {formData.eleccionEvaluacionModelo26 && <p>Justificación de la elección del modelo: {formData.eleccionEvaluacionModelo26}</p>}
            <p className="mb-2">Preprocesamiento de los datos para evaluación: {formData.preprocesamientoEvaluacionModelo27 || 'No se especificaron'}</p>
            </>
          ))}


          {renderSection('Consideraciones éticas', (
            <>
            <p className="mb-2">El modelo {formData.modeloCategoriza30 || 'No'} categoriza las personas</p>
            {formData.razonesdecisionNegativapersonas31 && (
              <p className="mb-2">Circunstancias de decisión negativa: {formData.razonesdecisionNegativapersonas31}</p>
            )}
            <p className="mb-2">El modelo {formData.datosPersonalesTA32 || 'No'} usa datos personales</p>
            {formData.cualesdatosPersonales321 && (
              <p className="mb-2">Datos personales utilizados: {formData.cualesdatosPersonales321}</p>
            )}
            <p className="mb-2">El modelo {formData.datoSensible33 || 'No'} usa datos sensibles</p>
            {formData.tipoDatoSensible331 && (
              <p className="mb-2">Datos sensibles utilizados: {formData.tipoDatoSensible331}</p>
            )}
            <p className="mb-2">El modelo {formData.asuntosCentralesModelo34 || 'No'} toma decisiones importantes para la vida</p>
            {formData.tipoAsuntosCentralesModelo341 && (
              <p className="mb-2">Asuntos centrales para la vida: {formData.tipoAsuntosCentralesModelo341}</p>
            )}
            {formData.estrategiasMitigacionModelo35 && (
              <p className="mb-2">Estrategias de mitigación de riesgos: {formData.estrategiasMitigacionModelo35}</p>
            )}
            {formData.riesgoUsoModelo36 && (
              <p className="mb-2">Riesgos del modelo: {formData.riesgoUsoModelo36}</p>
            )}
            {formData.casosUsoconocidos37 && (
              <p className="mb-2">Casos de uso problemáticos: {formData.casosUsoconocidos37}</p>
            )}
            {formData.otraConsideracion38 && (
              <p>Otras consideraciones: {formData.otraConsideracion38}</p>
            )}
            </>
          ))}
          
          {renderSection('Advertencias y Recomendaciones', (
            <>
            {formData.pruebaAdicional39 && <p className="mb-2">Pruebas adicionales: {formData.pruebaAdicional39}</p>}
            <p className="mb-2">{formData.grupoRelevante40 || 'No'} hay grupos relevantes NO representados en el conjunto de datos.</p>
            {formData.recomendacionesAdicionales41 && (
              <p className="mb-2">Recomendaciones adicionales: {formData.recomendacionesAdicionales41}</p>
            )}
            {formData.caracteristicasIdeales42 && (
              <p>Características ideales del conjunto de datos: {formData.caracteristicasIdeales42}</p>
            )}
            </>
          ))}

          {renderSection('Reclamaciones', (
            <>
            <p className="mb-2">El modelo {formData.reclamacionTA43 || 'No'} tiene una vía para realizar reclamaciones.</p>
            {formData.viaReclamacionTA44 && <p>Vía de reclamación: {formData.viaReclamacionTA44}</p>}
            </>
          ))}

        </div>
        

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© {year} Herramienta de transparencia de modelo diseñada por GobLab. Todos los derechos reservados.</p>
          <p>Elaborado en {elaborationDate}.</p>
        </footer>

       
      </div>
      {!isPdfGeneration && (
          <div className='print:hidden flex justify-between mt-8 max-w-4xl mx-auto '>
            <Button onClick={onClose} variant="outline">Volver</Button>
            <Button onClick={onGeneratePDF} disabled={!imagesLoaded}>Exportar a PDF</Button>
          </div>
        )}
    </div>
  )
}

