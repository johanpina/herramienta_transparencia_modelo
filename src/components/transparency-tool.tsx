'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Check, HelpCircle, ChevronRight, ChevronLeft, Send } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { CustomDatePicker } from "@/components/ui/date-picker"
import 'react-datepicker/dist/react-datepicker.css'
import { PreviewFicha } from './preview-ficha'


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
//import { ScrollArea } from "@/components/ui/scroll-area"
//import { Separator } from "@/components/ui/separator"
import Image from 'next/image'
//import Link from 'next/link'
import { InfoSidebar } from '@/components/InfoSidebar'

interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'radio' | 'slider' | 'date';
  options?: string[];
  isRequired: boolean;
  tooltip: string;
  min?: number;
  max?: number;
  step?: number;
  dependsOn?: {
    questionId: string;
    value: string | number;
  };
  placeholder?: string;
}

interface Section {
  id: string;
  title: string;
  questions: Question[];
}

const sections: Section[] = [
  {
    id: 'Visión General',
    title: 'Visión General',
    questions: [
      {
        id: 'nombreModelo1',
        text: 'Nombre del SDA (Sistema de Decisiones Automatizado)',
        type: 'text',
        isRequired: true,
        tooltip: 'Nombre identificatorio del sistema de decisiones automatizado (modelo, algoritmo o herramienta)',
        placeholder: 'Modelo PrioriSalud para priorización de pacientes (caso ejemplo ficticio)'
      },
      {
        id: 'tipoModelo2',
        text: '¿Qué tipo de SDA es?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Indica si el SDA es un modelo predictivo, sistema de recomendación, clasificación, etc, y cuál es su arquitectura.',
        placeholder: 'Modelo de clasificación supervisada.'
      },
      {
        id: 'propositoModelo3',
        text: 'Describa el propósito del proyecto y funcionalidad del SDA dentro de él',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Explica el objetivo general del proyecto y cómo el SDA contribuye a lograrlo.',
        placeholder: 'El proyecto busca mejorar los tiempos de atención en listas de espera. El SDA clasifica a los pacientes en tres niveles de prioridad (alta, media y baja) para facilitar su asignación a especialistas.'
      },
      {
        id: 'porqueModeloTA4',
        text: '¿Por qué se decidió utilizar este SDA en lugar de otro tipo de solución no algorítmica?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Justifica la elección de una solución algorítmica frente a otras alternativas posibles, como reglas manuales.',
        placeholder: 'La priorización previa era manual, heterogénea y dependía del criterio de cada centro de salud. El SDA permite mayor consistencia, trazabilidad y eficiencia en la asignación de prioridades.'
      },
      {
        id: 'alcanzarResultadosTA5',
        text: '¿Qué tarea(s) realiza el SDA para lograr alcanzar los resultados del proyecto? ',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Describe la acción específica que realiza el SDA (por ejemplo: predecir, clasificar, priorizar).',
        placeholder: 'Clasifica automáticamente a los pacientes ingresados en listas de espera en una categoría de prioridad.'
      },
      {
        id: 'usoPrevistoModelo6',
        text: '¿Cuál es el uso previsto del SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Indica en qué contexto y para qué fin se diseñó el uso del SDA.',
        placeholder: 'Asignar prioridades en las listas de espera de atención médica especializada dentro del sistema público de salud.'
      },
      {
        id: 'usoPrevistoModelo6y1',
        text: '¿Qué resultado puede esperar el usuario directo del SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Especifica cuál es la salida o respuesta esperada por parte de quien interactúa directamente con el SDA, siendo esta la persona afectada por las decisiones del sistema, persona que interactura directamente con el sistema y se ve afectada (para bien o para mal) por las decisiones de este ',
        placeholder: 'El profesional de salud recibe una categoría sugerida de prioridad para cada paciente, que puede revisar y confirmar.'
      },
      {
        id: 'usosNocontextModelo7',
        text: '¿Qué usos están fuera del alcance del SDA?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Detalla usos no permitidos o no contemplados originalmente en el diseño del SDA.',
        placeholder: 'No debe usarse para tomar decisiones clínicas ni para rechazar la atención a ningún paciente.'
      }
      /*{
        id: 'proyectoExistente',
        text: '1.5. Nombre del proyecto existente',
        type: 'text',
        isRequired: true,
        tooltip: 'Ingrese el nombre del proyecto existente que se está ampliando',
        dependsOn: {
          questionId: 'esAmpliacion',
          value: 'Sí'
        }
      },
      {
        id: 'fechaImplementacion',
        text: '1.6. Fecha estimada de implementación',
        type: 'text',
        isRequired: true,
        tooltip: 'Ingrese la fecha estimada en que el proyecto será implementado (formato: DD/MM/AAAA)'
      }*/
    ],
  },
  {
    id: 'Detalles del modelo',
    title: 'Detalles del modelo',
    questions: [
      {
        id: 'desarrolladorModelo8',
        text: 'Nombre de la organización responsable del SDA',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Entidad o institución que lidera el desarrollo, gestión o implementación del SDA. Si la institución que desarrolla el SDA y la institución que lo implementa son diferentes, indique la institución que lo implementa (institución que lo usa)',
        placeholder: "Departamento de Gestión de la Demanda - Hospital SDA"
      },
      {
        id: 'versionModelo9',
        text: '¿En qué versión se encuentra el SDA? ',
        type: 'text',
        isRequired: false,
        tooltip: 'Indica el número o identificador de la versión actual del SDA. \n Formato esperado: Número-versión',
        placeholder: '1.3 2024/11 o 1.3.0',
      },
      {
        id: 'fechaModelo10',
        text: 'Fecha de implementación del SDA',
        type: 'text',
        isRequired: true,
        tooltip: 'Fecha en que el SDA comenzó a ser utilizado operacionalmente. en formato AAAA/MM',
        placeholder: '2024/11',
      },
      {
        id: 'linkModelo11',
        text: 'Recursos para obtener más información del proyecto',
        type: 'text',
        isRequired: true,
        tooltip: 'Enlaces, documentos o contactos para ampliar la información sobre el SDA y su uso.',
        placeholder: 'http://www.salud.gob.cl/priorisalud',
        /*dependsOn: {
          questionId: 'nivelImpacto',
          value: 75
        }*/
      },
      {
        id: 'citaModelo12',
        text: '¿Cómo citar o hacer referencia formal a este SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Formato sugerido: Nombre institución (Año). Nombre sistema. Enlace. ',
        placeholder: 'Hospital SDA (2024). PrioriSalud – Sistema de Prioridad Algorítmica para Listas de Espera. www.salud.gob.cl/priorisalud'
      },
      {
        id: 'licenciaModelo13',
        text: '¿Qué tipo de licencia tiene el SDA?',
        type: 'text',
        isRequired: true,
        tooltip: 'Tipo de licencia legal que regula el uso del SDA (por ejemplo: software libre, licencia propietaria, No Aplica, etc.).',
        placeholder: 'Licencia pública de uso institucional.'
      },
      /*{
        id: 'contactoModelo14',
        text: '¿Hay algún canal de reclamos o sugerencias mediante los cuales las personas puedan solicitar más información?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        placeholder: ''
      },*/
    ],
  },
  {
    id: 'Categorización o elaboración de perfiles',
    title: 'Categorización o elaboración de perfiles',
    questions: [
      {
        id: 'classModeloTA15',
        text: '¿El SDA categoriza, clasifica o elabora perfiles o etiquetas de individuos?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: 'Indica si el SDA asigna etiquetas o perfiles a personas, como "aprobado", "alto riesgo", "prioritario", etc.'
      },
      {
        id: 'classModelocategoriasTA16',
        text: '¿Cuáles son esos perfiles o categorías? Describa brevemente cada uno.',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Lista y explica el significado de cada categoría o perfil que el SDA asigna.',
        placeholder: 'Alta prioridad: riesgo alto para la salud si no recibe atención en corto plazo. Media: condición estable pero requiere seguimiento. Baja: casos sin urgencia.',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }
      },
      {
        id: 'classModelocategoriasTA16y1',
        text: 'Indique el motivo o fundamento en virtud de los que la categoría es relevante para que el SDA alcance sus resultados',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Explica por qué esas categorías ayudan a cumplir con el propósito del SDA.',
        placeholder: 'La categoría determina el orden en que se otorgan las horas médicas, lo que permite gestionar mejor los recursos limitados.',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }
      },
      {
        id: 'classModelocategoriasTA16y2',
        text: 'Indique la metodología que utiliza el SDA para asignar las categorías.',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Describe el procedimiento técnico o lógico para categorizar (modelo estadístico, reglas, umbrales, etc.).',
        placeholder: 'Modelo de clasificación entrenado con datos históricos, utilizando Random Forest y calibrado con validación cruzada.',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }
      },
      {
        id: 'classModelocategoriasTA16y3',
        text: 'Indique el efecto de las variables en la asignación de categorías. ',
        type: 'textarea',
        isRequired: false,
        tooltip: '¿Qué variables son relevantes para esta asignación de categorías?',
        placeholder: 'La variable más influyente es el tipo de diagnóstico, seguida por edad del paciente, historial médico y situación socioeconómica.',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }
      },
      {
        id: 'classModelometodologiaTA17',
        text: 'Consecuencias previstas que el uso de datos personales en el contexto del SDA puede tener en el titular de datos ',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        placeholder: 'La categorización podría influir en los tiempos de espera, generando impactos en el acceso a la salud.',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }
      },
      
      {
        id: 'classModelorelevanciaTA19',
        text: '¿Por qué la categoría, perfil o prioridad es relevante para que el modelo alcance sus resultados?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }

      },
    ],
  },
  {
    id: 'Métricas de desempeño',
    title: 'Métricas de desempeño',
    questions: [
      {
        id: 'metricasModelo20',
        text: '¿Qué métricas se utilizan para medir el desempeño del SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Indica las métricas de evaluación utilizadas, como precisión, recall, AUC, etc.',
        placeholder: 'Exactitud, recall para la clase “alta prioridad” y matriz de confusión.'
      },
      {
        id: 'umbralDecisionModelo21',
        text: '¿A partir de que valor se considera que se obtiene un buen desempeño? Contestar para cada métrica establecida',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Define el umbral o rango aceptable de cada métrica para considerar que el SDA funciona bien.',
        placeholder: 'Recall superior a 0.80 para alta prioridad y exactitud total mayor a 0.85.'
      },
      {
        id: 'umbralDecisionModelo21y1',
        text: '¿Qué valor se obtuvo en la medición de dicha métrica? Contestar para cada métrica',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Indica el resultado real obtenido por el SDA en cada métrica.',
        placeholder: 'Recall: 0.83, Exactitud: 0.87'
      },

      {
        id: 'caluloMedicionesModelos22',
        text: '¿Por qué se decide usar estas métricas frente a otras? ',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Justifica la elección de métricas específicas en lugar de otras posibles.',
        placeholder: 'El recall en “alta prioridad” es crítico para no dejar fuera a pacientes con mayor necesidad.'
      },
    ],
  },
  {
    id: 'Datos de entrenamiento',
    title: 'Datos de entrenamiento',
    questions: [
      {
        id: 'datosModelo23',
        text: '¿Qué datos se utilizaron para el entrenamiento del SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Identifica el conjunto de datos utilizado en la etapa de entrenamiento (fuente, variables relevantes, periodo, tamaño, etc.).',
        placeholder: 'Un subconjunto de pacientes con diagnóstico validado y decisión médica histórica, de los últimos 2 años. Se utilizó el 80% para entrenamiento.'
      },
      {
        id: 'ProcesamientoModelo24',
        text: 'Indique los pasos de preprocesamiento aplicados a los datos',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Describe las transformaciones aplicadas antes de entrenar o evaluar el modelo (limpieza, normalización, etc.).',
        placeholder: 'Por ejemplo, Imputación de valores faltantes, normalización de variables numéricas, codificación de variables categóricas.'
      },
      {
        id: 'ProcesamientoModelo24y1',
        text: '¿Por qué se decidió usar estos datos para el SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Explica los criterios de selección de los datos usados (disponibilidad, calidad, representatividad).',
        placeholder: 'Eran los únicos datos clínicos disponibles a nivel nacional y representaban adecuadamente a la población objetivo.',
      },
    ],
  },
  {
    id: 'Datos de evaluación',
    title: 'Datos de evaluación',
    questions: [
      {
        id: 'conjuntosEvalModelo25',
        text: '¿Qué datos se utilizaron para evaluar el SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Identifica el conjunto de datos utilizado en la etapa de evaluación (fuente, variables relevantes, periodo, tamaño, etc.).',
        placeholder: 'Un subconjunto de pacientes con diagnóstico validado y decisión médica histórica, de los últimos 2 años. Se utilizó el 20% para evaluación. '
      },
      {
        id: 'preprocesamientoEvaluacionModelo27',
        text: 'Indique los pasos de preprocesamiento aplicados a los datos',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Describe las transformaciones aplicadas antes de entrenar o evaluar el modelo (limpieza, normalización, etc.).',
        placeholder: 'Imputación de valores faltantes, normalización de variables numéricas, codificación de variables categóricas.'
      },
    ],
  },
  {
    id: 'Consideraciones éticas',
    title: 'Consideraciones éticas',
    questions: [
      {
        id: 'modeloCategoriza30',
        text: '¿El SDA categoriza o perfila a las personas?',
        type: 'radio',
        options: ['Sí', 'No', 'No aplica'],
        isRequired: true,
        tooltip: 'Confirma si el modelo genera perfiles o categorías individuales que pueden afectar decisiones.'
      },
      {
        id: 'razonesdecisionNegativapersonas31',
        text: '¿Qué circunstancias o factores llevan a plasmar, en el acto administrativo, una decisión negativa respecto de la persona?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Describe cómo se relacionan los perfiles del SDA con decisiones desfavorables para las personas.',
        placeholder: 'La asignación de “baja prioridad” puede significar una espera prolongada para la atención médica.',
        dependsOn: {
          questionId: '30_modeloCategoriza',
          value: 'Sí'
        }
      },
      {
        id: 'datosPersonalesTA32',
        text: '¿El SDA utiliza datos personales?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: 'Confirma si el SDA procesa información que permite identificar directa o indirectamente a las personas.'
      },
      {
        id: 'cualesdatosPersonales321',
        text: 'En caso de que sí se usen datos personales, indicar cuáles',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Lista los tipos de datos personales utilizados (ej. nombre, edad, dirección, etc.).',
        placeholder: 'Edad, dirección, diagnóstico médico, historial de hospitalizaciones.',
        dependsOn: {
          questionId: 'datosPersonalesTA32',
          value: 'Sí'
        }
      },
      {
        id: 'datoSensible33',
        text: '¿El SDA utiliza datos sensibles?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: 'Confirma si el SDA utiliza información considerada sensible según la normativa (ej. salud, datos biométricos).'
      },
      {
        id: 'tipoDatoSensible331',
        text: 'En caso de que sí se usen datos sensibles, indicar cuáles',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Lista los tipos de datos sensibles utilizados.',
        placeholder: 'Diagnósticos médicos y condiciones de salud.',
        dependsOn: {
          questionId: 'datoSensible33',
          value: 'Sí'
        }
      },
      {
        id: 'asuntosCentralesModelo34',
        text: '¿El SDA apoya o reemplaza la toma de decisiones sobre aspectos fundamentales de la vida de las personas? Por ejemplo, en ámbitos como educación, seguridad, salud, entre otros.',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: 'Indica si el SDA incide directamente en decisiones críticas como acceso a salud, educación, beneficios, trabajo, etc.'
      },
      {
        id: 'tipoAsuntosCentralesModelo341',
        text: 'En caso de que sí, ¿en qué ámbito?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Describe en qué área afecta directamente las decisiones críticas, como acceso a salud, educación, beneficios, trabajo, etc.',
        placeholder: 'Acceso a servicios de salud.',
        dependsOn: {
          questionId: 'asuntosCentralesModelo34',
          value: 'Sí'
        }
      },
      {
        id: 'riesgoUsoModelo36',
        text: 'Describe los posibles riesgos éticos identificados en relación a la implementación del proyecto',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Expone los principales problemas éticos detectados (sesgos, opacidad, exclusión, impacto social, medioambiental, etc.).',
        placeholder: 'Sesgo contra personas mayores o con menos historial clínico en el sistema. Discriminación indirecta por nivel educacional.'
      },
      {
        id: 'casosUsoconocidos37',
        text: '¿Se conocen casos de uso particulares que sean problemáticos para la institución, sus usuarios o las personas afectadas por el SDA? Descríbelos y explica cómo se abordan esos casos',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Relata ejemplos donde el uso del SDA haya generado dudas, conflictos o efectos no deseados.',
        placeholder: 'En zonas rurales con mala calidad de datos, el SDA ha clasificado erróneamente a pacientes. Se estableció un protocolo de revisión manual en estos casos.'
      },
      {
        id: 'estrategiasMitigacionModelo35',
        text: '¿Qué medidas y acciones se realizaron para mitigar posibles riesgos éticos?', 
        type: 'textarea',
        isRequired: true,
        tooltip: 'Describe acciones tomadas para reducir riesgos como sesgos, discriminación o falta de transparencia.',
        placeholder: 'Se implementó una revisión médica posterior obligatoria, y se entrena el modelo con criterios de equidad.'
      },
      {
        id: 'otraConsideracion38',
        text: 'De existir alguna otra consideración ética adicional que se haya tenido en cuenta durante el desarrollo y operacionalización del SDA, indicar en este apartado.',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Espacio libre para incluir otros elementos éticos relevantes no cubiertos en las preguntas anteriores.',
        placeholder: 'Se consultó a una mesa de bioética y a representantes de organizaciones de pacientes en la fase de diseño.'
      },

    ],
  },
  {
    id: 'Advertencias y recomendaciones',
    title: 'Advertencias y recomendaciones',
    questions: [
      {
        id: 'pruebaAdicional39',
        text: '¿Los resultados de implementación del SDA sugieren alguna prueba adicional? Descríbelas.',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Indica si es necesario realizar más validaciones o monitoreos para mejorar el desempeño o confianza.',
        placeholder: 'Sí, se están planificando pruebas A/B para comparar su desempeño con la priorización tradicional.'

      },
      
      {
        id: 'recomendacionesAdicionales41',
        text: '¿Existen recomendaciones adicionales para el uso del SDA en el proyecto?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Entrega sugerencias para mejorar o ajustar el uso del SDA durante su uso o en el futuro.',
        placeholder: "Utilizarlo como apoyo, pero nunca como única fuente de decisión. Mantener revisión médica obligatoria."
      },
      {
        id: 'caracteristicasIdeales42',
        text: '¿Cuáles son las características ideales de un conjunto de datos para este SDA?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Define los atributos deseables en los datos para que el SDA funcione de forma óptima.',
        placeholder: 'Cobertura nacional, datos clínicos actualizados, buena calidad en registros y variables sociales complementarias.',

      },
      {
        id: 'grupoRelevante40',
        text: '¿Existe algún grupo relevante que no está representado en el conjunto de datos utilizado en el SDA? Si es así, descríbalo.',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Indique el estado actual del cumplimiento normativo del proyecto',
        placeholder: 'La población migrante reciente no está suficientemente representada en los datos históricos.'      
      },
    ],
  },
  {
    id: 'Reclamación',
    title: 'Reclamación',
    questions: [
      {
        id: 'reclamacionTA43',
        text: '¿Existe una vía de reclamación a la que las personas puedan acceder para obetener más información del SDA o hacer llegar reclamos por sus decisiones?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: 'Indica si las personas afectadas por el SDA pueden reclamar o solicitar información sobre sus decisiones.'
      },
      {
        id: 'viaReclamacionTA44',
        text: '¿Cuál es la forma de acceder a la vía de reclamación?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Describe los canales de acceso disponibles para interponer reclamos (web, correo, formulario, presencial etc.).',
        placeholder:'A través del sitio web del Hospital SDA (www.salud.gob.cl/priorisalud) o en oficinas de atención ciudadana.',
        dependsOn: {
          questionId: 'reclamacionTA43',
          value: 'Sí'
        }
      },
      
    ],
  }
];

function TransparencyTool() {
  const [activeSection, setActiveSection] = useState('Visión General')
  const { toast } = useToast()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isAllRequiredAnswered, setIsAllRequiredAnswered] = useState(false)
  const [isLastSection, setIsLastSection] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [organization, setOrganization] = useState('')
  const [expandedTooltip, setExpandedTooltip] = useState<string | null>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail')
    const savedAnswers = localStorage.getItem(`answers_${userEmail}`)
    if (savedAnswers) {
      const parsedAnswers = JSON.parse(savedAnswers)
      setFormData(parsedAnswers)

      // Encuentra la última sección con respuestas
      const lastAnsweredSection = sections.reduce((last, section) => {
        const hasAnswers = section.questions.some(q => parsedAnswers[q.id])
        return hasAnswers ? section : last
      }, sections[0])

      setActiveSection(lastAnsweredSection.id)
    }
  }, [])


  useEffect(() => {
    checkRequiredQuestions()
    setIsLastSection(activeSection === sections[sections.length - 1].id)
  }, [formData, activeSection])

  const handleInputChange = (questionId: string, value: any) => {
    const newFormData = {
      ...formData,
      [questionId]: value
    }
    setFormData(newFormData)

    // Save answers to localStorage
    const userEmail = localStorage.getItem('userEmail')
    if (userEmail) {
      localStorage.setItem(`answers_${userEmail}`, JSON.stringify(newFormData))
    }
  }

  const checkRequiredQuestions = () => {
    const allAnswered = sections.every(section =>
      section.questions.every(question => {
        if (!question.isRequired) return true
        if (question.dependsOn) {
          const dependentValue = formData[question.dependsOn.questionId]
          if (question.dependsOn.value === dependentValue) {
            return formData[question.id] && formData[question.id].length > 0
          }
          return true
        }
        return formData[question.id] && formData[question.id].length > 0
      })
    )
    setIsAllRequiredAnswered(allAnswered)
  }

  const handleSaveResponses = () => {
    
    toast({
      title: "Respuestas guardadas",
      description: "Tus respuestas han sido guardadas exitosamente.",
    })
  }

  const handleNextSection = () => {
    const currentIndex = sections.findIndex(section => section.id === activeSection)
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id)
    }
  }

  const shouldShowQuestion = (question: Question) => {
    if (!question.dependsOn) return true
    const dependentValue = formData[question.dependsOn.questionId]
    if (question.type === 'slider') {
      return dependentValue >= question.dependsOn.value
    }
    return dependentValue === question.dependsOn.value
  }


  const handleOpenPreview = () => {
    if (isAllRequiredAnswered) {
      setShowPreview(true)
    } else {
      toast({
        title: "Error",
        description: "Por favor, completa todas las preguntas obligatorias antes de generar la vista previa.",
        variant: "destructive",
      })
    }
  }

  const renderQuestion = (question: Question, sectionIndex: number, questionIndex: number) => {
    if (!shouldShowQuestion(question)) return null

    const questionNumber = `${sectionIndex + 1}.${questionIndex + 1}`

    switch (question.type) {
      case 'text':
        return (
          <Input
            id={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        )
      case 'textarea':
        return (
          <Textarea
            id={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        )
      case 'radio':
        return (
          <RadioGroup
            value={formData[question.id] || ''}
            onValueChange={(value) => handleInputChange(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 'slider':
        return (
          <div className="space-y-4">
            <Slider
              id={question.id}
              min={question.min}
              max={question.max}
              step={question.step}
              value={[formData[question.id] || 0]}
              onValueChange={(value) => handleInputChange(question.id, value[0])}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{question.min}</span>
              <span>{formData[question.id] || 0}</span>
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
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <InfoSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        feedback={feedback}
        setFeedback={setFeedback}
        organization={organization}
        setOrganization={setOrganization}
      />

      <div className="flex-1">

      <div className="flex justify-between items-center p-4 rounded-lg backdrop-blur-sm">
        {/* Elemento Izquierdo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/images/logo-goblab-uai.png"
            alt="Gob_Lab UAI"
            width={260} // Ajusta el tamaño de la imagen según sea necesario
            height={100}
            //objectFit='contain'
            
          />
        </div>
        

        {/* Elemento Central */}
        <h1 className="text-3xl font-bold text-center flex-1 ">Ficha de transparencia del modelo</h1>

        {/* Elemento Derecho */}
        <div className="flex items-center space-x-2">
          <Image
            src="/images/herramientas.png"
            alt="HERRAMIENTAS ALGORITMOS ÉTICOS"
            width={280} // Ajusta el tamaño de la imagen según sea necesario
            height={100}
            //objectFit='contain'
          
          />
        </div>
      </div>

        <div className="container mx-auto p-4">
          {!isSidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mb-4"> 
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div className="grid grid-cols-[300px_1fr] gap-8">
            {/* Lista de Secciones */}
            <div className="space-y-1">
              <h2 className="mb-4 text-xl font-bold">Dimensiones</h2>
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{`${index + 1}. ${section.title}`}</span>
                  {section.questions.every(q => !q.isRequired || !shouldShowQuestion(q) || (formData[q.id] && formData[q.id].length > 0)) && (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              ))}
            </div>

            {/* Contenido Principal */}
            <div className="space-y-8">


              <Card className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold">
                  {sections.findIndex(s => s.id === activeSection) + 1}. {sections.find(s => s.id === activeSection)?.title}
                </h2>
                
                <div className="mb-4 rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <HelpCircle className="h-5 w-5" />
                    <p>Cada pregunta incluye un ícono de ayuda con información adicional</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {sections.find(s => s.id === activeSection)?.questions.map((question, questionIndex) => (
                    shouldShowQuestion(question) && (
                      <div key={question.id} className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={question.id} className="flex items-center">
                            {`${sections.findIndex(s => s.id === activeSection) + 1}.${questionIndex + 1} ${question.text}`}
                            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <div className="relative">
                            <button
                              type="button"
                              aria-label="Mostrar ayuda"
                              onClick={() => setExpandedTooltip(expandedTooltip === question.id ? null : question.id)}
                              className="focus:outline-none"
                            >
                              <HelpCircle className="h-5 w-5 text-gray-400 cursor-pointer" />
                            </button>
                            {/* Tooltip personalizado para click/touch */}
                            {expandedTooltip === question.id && (
                              <div
                                className="absolute right-0 z-50 mt-2 w-64 rounded-md bg-gray-100 p-4 shadow-lg text-sm text-gray-800"
                                style={{ minWidth: '200px' }}
                                onClick={() => setExpandedTooltip(null)}
                                tabIndex={0}
                                role="dialog"
                              >
                                <p>{question.tooltip}</p>
                                <div className="text-right mt-2">
                                  <button
                                    type="button"
                                    className="text-blue-600 text-xs"
                                    aria-label="Cerrar tooltip"
                                    onClick={e => { e.stopPropagation(); setExpandedTooltip(null); }}
                                  >
                                    &#10005;
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {renderQuestion(question, sections.findIndex(s => s.id === activeSection), questionIndex)}
                      </div>
                    )
                  ))}
                </div>
              </Card>

              {/* Botones de acción */}
              <div className="flex justify-between gap-4">
                <Button onClick={handleSaveResponses}>Guardar Respuestas</Button>
                <Button
                    onClick={handleOpenPreview}
                    variant="outline"
                    disabled={!isAllRequiredAnswered}
                  >
                    Vista previa / Exportar PDF
                  </Button>
                <div className="space-x-4">
                  
                  <Button onClick={handleNextSection} disabled={isLastSection}>
                    Siguiente Sección
                    <ChevronRight className="ml-2 h-4 w-5" />
                  </Button>
                </div>
              </div>  
            </div>
          </div>
        </div>
      </div>
      
      {showPreview && (
        <PreviewFicha
          formData={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

export default TransparencyTool;