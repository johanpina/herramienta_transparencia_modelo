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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'
import Link from 'next/link'
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
        text: 'Nombre del modelo',
        type: 'text',
        isRequired: true,
        tooltip: 'Ingrese el nombre completo del modelo'
      },
      {
        id: 'tipoModelo2',
        text: '¿Qué tipo de modelo es?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Esto incluye detalles básicos de la arquitectura del modelo, como si es un clasificador de Naive Bayes, una Red Neuronal Convolucional, etc. Esto es probablemente relevante para desarrolladores de software y modelos, así como para personas conocedoras de aprendizaje automático, para resaltar qué tipos de suposiciones están codificadas en el sistema.',
        placeholder: 'Ejemplo: Un modelo Red Neuronal Convolucional que toma como entrada imágenes de rayos X.'
      },
      {
        id: 'propositoModelo3',
        text: 'Describa el propósito y funcionalidad del modelo',
        type: 'textarea',
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'porqueModeloTA4',
        text: '¿Por qué se decidió utilizar este SDA en lugar de otro tipo de solución?',
        type: 'textarea',
        isRequired: false,
        tooltip: ''
      },
      {
        id: 'alcanzarResultadosTA5',
        text: '¿Cómo el modelo alcanza u obtiene sus resultados?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Describa el flujo de funciomaiento de su sistema para generar un resultado'
      },
      {
        id: 'usoPrevistoModelo6',
        text: '¿Cuál es el uso previsto del modelo?',
        type: 'textarea',
        isRequired: true,
        tooltip: '¿Qué puede esperar el usuario directo del modelo al emplearlo?. Esta sección detalla si el modelo se desarrolló con tareas generales o específicas en mente. Los casos de uso pueden estar definidos de manera amplia o estrecha según lo que los desarrolladores pretendan. Por ejemplo, si el modelo se construyó simplemente para etiquetar imágenes, esta tarea debería indicarse como el caso de uso principal previsto.',
        placeholder: '¿Qué puede esperar el usuario directo del modelo al emplearlo?. Esta sección detalla si el modelo se desarrolló con tareas generales o específicas en mente. Los casos de uso pueden estar definidos de manera amplia o estrecha según lo que los desarrolladores pretendan. Por ejemplo, si el modelo se construyó simplemente para etiquetar imágenes, esta tarea debería indicarse como el caso de uso principal previsto.'
      },
      {
        id: 'usosNocontextModelo7',
        text: '¿Qué usos están fuera del alcance del modelo?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Aquí, la ficha del modelo debería resaltar la tecnología con la que el modelo podría confundirse fácilmente, o contextos relacionados a los que los usuarios podrían intentar aplicar el modelo.',
        placeholder: 'Aquí, la ficha del modelo debería resaltar la tecnología con la que el modelo podría confundirse fácilmente, o contextos relacionados a los que los usuarios podrían intentar aplicar el modelo.'
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
        text: '¿Qué persona u organización desarrolló el modelo?',
        type: 'textarea',
        isRequired: true,
        tooltip: '',
        placeholder: "Esto puede ser utilizado por todas las partes interesadas para inferir detalles relacionados con el desarrollo del modelo y posibles conflictos de interés."
      },
      {
        id: 'versionModelo9',
        text: '¿Cuál es la versión del modelo?',
        type: 'text',
        isRequired: false,
        tooltip: 'Describa el número de la versión del modelo. Ej: 1.0.0',
        placeholder: 'Describa el número de la versión del modelo. Ej: 1.0.0',
      },
      {
        id: 'fechaModelo10',
        text: '¿Cuándo se desplegó o implementó este modelo?',
        type: 'date',
        isRequired: true,
        tooltip: 'Esto es útil para que todas las partes interesadas se informen sobre las técnicas y fuentes de datos que probablemente estuvieron disponibles durante el desarrollo del modelo.',
        placeholder: 'YYYY/MM/DD',
      },
      {
        id: 'linkModelo11',
        text: '¿Dónde se pueden encontrar recursos para obtener información adicional del proyecto?',
        type: 'text',
        isRequired: true,
        tooltip: 'Por ejemplo, link a la página institucional',
        placeholder: 'Por ejemplo, link a la página institucional',
        /*dependsOn: {
          questionId: 'nivelImpacto',
          value: 75
        }*/
      },
      {
        id: 'citaModelo12',
        text: '¿Cómo debería citarse el modelo?',
        type: 'textarea',
        isRequired: true,
        tooltip: '',
        placeholder: ''
      },
      {
        id: 'licenciaModelo13',
        text: '¿Qué tipo de licencia tiene el modelo?',
        type: 'text',
        isRequired: true,
        tooltip: '',
        placeholder: ''
      },
      {
        id: 'contactoModelo14',
        text: '¿Hay algún canal de reclamos o sugerencias mediante los cuales las personas puedan solicitar más información?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        placeholder: ''
      },
    ],
  },
  {
    id: 'Clasificación',
    title: 'Clasificación',
    questions: [
      {
        id: 'classModeloTA15',
        text: '¿El modelo es de clasificación?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'classModelocategoriasTA16',
        text: '¿Qué perfiles o categorías asigna o existen?',
        type: 'textarea',
        isRequired: true,
        tooltip: 'Indique el estado actual del cumplimiento normativo del proyecto',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }
      },
      {
        id: 'classModelometodologiaTA17',
        text: '¿Qué forma, metodología o mecanismo usa el modelo para clasificar los datos? ¿Cuáles son los umbrales de decisión?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        dependsOn: {
          questionId: 'classModeloTA15',
          value: 'Sí'
        }
      },
      {
        id: 'classModeloefestovariablesTA18',
        text: '¿Qué efecto tiene cada variable o parámetro en la asignación de categoría, etiqueta, perfil o posición?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
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
    id: 'Métricas de rendimiento',
    title: 'Métricas de rendimiento',
    questions: [
      {
        id: 'metricasModelo20',
        text: '¿Qué métricas utiliza para medir el rendimiento de su modelo?',
        type: 'textarea',
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'umbralDecisionModelo21',
        text: '¿Cuál es el umbral de decisión del modelo?',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        isRequired: false,
        tooltip: 'Indique el estado actual del cumplimiento normativo del proyecto'
      },
      {
        id: 'caluloMedicionesModelos22',
        text: '¿Cómo se calculan las mediciones y estimaciones de estas métricas?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'También se deben incluir detalles sobre cómo se aproximan estos valores (por ejemplo, promedio de 5 ejecuciones, validación cruzada de 10 pliegues).',
        placeholder: 'Por ejemplo, esto puede incluir desviación estándar, varianza, intervalos de confianza o divergencia KL.'
      },
    ],
  },
  {
    id: 'Datos de entrenamiento',
    title: 'Datos de entrenamiento',
    questions: [
      {
        id: 'datosModelo23',
        text: '¿Qué datos se utilizaron para el entrenamiento del modelo?',
        type: 'textarea',
        isRequired: true,
        tooltip: '',
        
      },
      {
        id: 'ProcesamientoModelo24',
        text: '¿Se aplicaron pasos de pre-procesamiento o limpieza a los datos? ¿Cuáles?',
        type: 'textarea',
        isRequired: true,
        tooltip: ''
      },
    ],
  },
  {
    id: 'Datos de evaluación',
    title: 'Datos de evaluación',
    questions: [
      {
        id: 'conjuntosEvalModelo25',
        text: '¿Qué conjuntos de datos se utilizaron para evaluar el modelo?',
        type: 'textarea',
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'eleccionEvaluacionModelo26',
        text: '¿Por qué se eligieron estos conjuntos de datos?',
        type: 'textarea',
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'preprocesamientoEvaluacionModelo27',
        text: '¿Cómo se preprocesaron los datos para la evaluación?',
        type: 'textarea',
        isRequired: false,
        tooltip: '(por ejemplo, tokenización de oraciones, recorte de imágenes, cualquier filtrado como eliminar imágenes sin caras)',
        placeholder: '(por ejemplo, tokenización de oraciones, recorte de imágenes, cualquier filtrado como eliminar imágenes sin caras)'
      },
    ],
  },
  {
    id: 'Consideraciones éticas',
    title: 'Consideraciones éticas',
    questions: [
      {
        id: 'modeloCategoriza30',
        text: '¿El modelo categoriza o perfila a las personas?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'razonesdecisionNegativapersonas31',
        text: '¿Qué circunstancias llevan a una decisión negativa respecto de la persona?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        dependsOn: {
          questionId: '30_modeloCategoriza',
          value: 'Sí'
        }
      },
      {
        id: 'datosPersonalesTA32',
        text: '¿El modelo utiliza datos personales?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'cualesdatosPersonales321',
        text: '¿Cuáles?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        dependsOn: {
          questionId: 'datosPersonalesTA32',
          value: 'Sí'
        }
      },
      {
        id: 'datoSensible33',
        text: '¿El modelo utiliza algún dato sensible (por ejemplo, ley antidiscriminación)?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'tipoDatoSensible331',
        text: '¿Cuáles tipos de datos sensibles se utilizaron?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        dependsOn: {
          questionId: 'datoSensible33',
          value: 'Sí'
        }
      },
      {
        id: 'asuntosCentralesModelo34',
        text: '¿Se pretende que el modelo informe decisiones sobre asuntos centrales para la vida o el florecimiento humano, como la salud o la seguridad? ¿O podría usarse de esa manera?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'tipoAsuntosCentralesModelo341',
        text: '¿Cuáles?',
        type: 'textarea',
        isRequired: false,
        tooltip: '',
        dependsOn: {
          questionId: 'asuntosCentralesModelo34',
          value: 'Sí'
        }
      },
      {
        id: 'estrategiasMitigacionModelo35',
        text: '¿Qué estrategias de mitigación de riesgos se utilizaron durante el desarrollo del modelo?', 
        type: 'textarea',
        isRequired: true,
        tooltip: '',
      },
      {
        id: 'riesgoUsoModelo36',
        text: '¿Qué riesgos pueden estar presentes en el uso del modelo?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Intenta identificar a los posibles receptores, la probabilidad y la magnitud de los daños. Si no se pueden determinar, indique que se consideraron pero siguen siendo desconocidos.',
      },
      {
        id: 'casosUsoconocidos37',
        text: '¿Se conocen casos de uso indebido del modelo?',
        type: 'textarea',
        isRequired: false,
        tooltip: ''
      },
      {
        id: 'otraConsideracion38',
        text: 'De existir alguna otra consideración ética adicional que se haya tenido en cuenta en el desarrollo del modelo, indicar en este apartado.',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Por ejemplo, revisión por parte de un consejo externo o pruebas con una comunidad específica.',
        placeholder: 'Por ejemplo, revisión por parte de un consejo externo o pruebas con una comunidad específica.'
      },

    ],
  },
  {
    id: 'Advertencias y recomendaciones',
    title: 'Advertencias y recomendaciones',
    questions: [
      {
        id: 'pruebaAdicional39',
        text: '¿Los resultados sugieren alguna prueba adicional?',
        type: 'textarea',
        isRequired: false,
        tooltip: ''
      },
      {
        id: 'grupoRelevante40',
        text: '¿Hubo algún grupo relevante que no estuvo representado en el conjunto de datos de evaluación?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: false,
        tooltip: 'Indique el estado actual del cumplimiento normativo del proyecto'
      },
      {
        id: 'recomendacionesAdicionales41',
        text: '¿Existen recomendaciones adicionales para el uso del modelo?',
        type: 'textarea',
        isRequired: false,
        tooltip: 'Si se han identificado desafíos legales, descríbalos aquí'
      },
      {
        id: 'caracteristicasIdeales42',
        text: '¿Cuáles son las características ideales de un conjunto de datos de evaluación para este modelo?',
        type: 'textarea',
        isRequired: true,
        tooltip: '',
        placeholder: 'Ejemplos: \n Carpeta con imágenes de 20x20 \n Archivo csv con las columnas: edad,genero,salario, etc \n formulario predefinido con todas las respuestas',

      },
    ],
  },
  {
    id: 'Reclamación',
    title: 'Reclamación',
    questions: [
      {
        id: 'reclamacionTA43',
        text: '¿Existe una vía de reclamación especial respecto de las decisiones del modelo?',
        type: 'radio',
        options: ['Sí', 'No'],
        isRequired: true,
        tooltip: ''
      },
      {
        id: 'viaReclamacionTA44',
        text: '¿Cuál es la forma de acceder a la vía de reclamación?',
        type: 'textarea',
        isRequired: true,
        tooltip: '',
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
  const printContentRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [organization, setOrganization] = useState('')

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
    console.log('Guardando respuestas:', formData)
    toast({
      title: "Respuestas guardadas",
      description: "Tus respuestas han sido guardadas exitosamente.",
    })
  }

  const handleGeneratePDF = () => {
    if (isAllRequiredAnswered) {
      setShowPreview(true);
      setTimeout(() => {
        const html2pdf = require('html2pdf.js');
        const element = document.querySelector('.ficha-content') as HTMLElement;
        if (element) {
          const opt = {
            margin: 10,
            filename: 'ficha_transparencia.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              //logging: true,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          html2pdf(element, opt).then(() => {
            setShowPreview(false);
            console.log('PDF generado con éxito');
            toast({
              title: "PDF Generado",
              description: "El archivo PDF con tus respuestas ha sido generado y descargado.",
            });
          }).catch((error: any) => {
            console.error('Error al generar el PDF:', error);
            toast({
              title: "Error",
              description: "Hubo un problema al generar el PDF. Por favor, inténtalo de nuevo.",
              variant: "destructive",
            });
          });
        }
      }, 1000); // Espera 1 segundo para asegurarse de que las imágenes se hayan cargado
    } else {
      toast({
        title: "Error",
        description: "Por favor, completa todas las preguntas obligatorias antes de generar el PDF.",
        variant: "destructive",
      })
    }
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


  const handleGeneratePreview = () => {
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
            src="/images/Logo_herramientas_algoritmos.png"
            alt="HERRAMIENTAS ALGORITMOS ÉTICOS"
            width={280} // Ajusta el tamaño de la imagen según sea necesario
            height={100}
            objectFit='contain'
          
          />
        </div>

        {/* Elemento Central */}
        <h1 className="text-3xl font-bold text-center flex-1 ">Ficha de transparencia del modelo</h1>

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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-5 w-5 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{question.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {renderQuestion(question, sections.findIndex(s => s.id === activeSection), questionIndex)}
                      </div>
                    )
                  ))}
                </div>
              </Card>

              {/* Botones de acción */}
              <div className="flex justify-between">
                <Button onClick={handleSaveResponses}>Guardar Respuestas</Button>
                <div className="space-x-4">
                  <Button onClick={handleGeneratePreview} variant="outline" disabled={!isAllRequiredAnswered}>
                    Vista Previa
                  </Button>
                  <Button onClick={handleGeneratePDF} variant="outline" disabled={!isAllRequiredAnswered}>
                    Generar PDF
                  </Button>
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
      {/* Contenedor oculto para imprimir */}
      <div ref={printContentRef} className="hidden"></div>
      <div className={showPreview ? 'visible' : 'hidden'}>
        <PreviewFicha 
          formData={formData} 
          onClose={() => setShowPreview(false)} 
          onGeneratePDF={handleGeneratePDF} 
        />
      </div>
    </div>
  )
}

export default TransparencyTool;