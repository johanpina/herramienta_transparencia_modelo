'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { InfoSidebar } from '@/components/InfoSidebar'
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, ChevronLeft, ChevronRight, HelpCircle, Send } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [organization, setOrganization] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const version = process.env.NEXT_PUBLIC_VERSION || '0.0.0';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      localStorage.setItem('userEmail', email)
      const savedAnswers = localStorage.getItem(`answers_${email}`)
      if (savedAnswers) {
        localStorage.setItem('currentAnswers', savedAnswers)
      }
      router.push('/herramienta-transparencia')
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <InfoSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        feedback={feedback}
        setFeedback={setFeedback}
        organization={organization}
        setOrganization={setOrganization}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ">
        <div className="max-w-3xl mx-auto p-8" >
          {!isSidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mb-4"> 
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {/* Header */}
          <div className="flex justify-between space-y-4 p-4 rounded-lg backdrop-blur-sm">
            <Image
              src="/images/logo-goblab-uai.png"
              alt="Gob Lab UAI"
              width={300}
              height={80}
            />
            <Image
              src="/images/herramientas.png"
              alt="Herramientas Algoritmos Éticos"
              width={300}
              height={80}
            />
            
          </div>

          {/* Version */}
          <div className="text-sm text-gray-600">V.{version}</div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6">
          Ficha de transparencia del modelo. 
          </h1>

          {/* Description */}
          <div className="space-y-4 mb-8 text-gray-700">
            <p>
              Una ficha de transparencia es un documento claro, accesible y fácil de entender que resume la información clave sobre un sistema de decisiones automatizado (SDA). Este instrumento cumple una doble función: transparentar el funcionamiento de un algoritmo ante usuarios finales y actores externos, y servir como estándar de documentación interna para los sistemas automatizados implementados por organizaciones públicas o privadas.
            </p>
            <p>
              Esta herramienta tiene como objetivo apoyar a instituciones de diversos sectores en la elaboración de fichas de transparencia para sistemas de decisiones automatizadas o semiautomatizadas (SDA), promoviendo una gestión responsable, ética y comprensible de estos sistemas. Su uso facilita el cumplimiento de estándares de transparencia algorítmica y contribuye a fortalecer la rendición de cuentas institucional, la confianza pública y el diseño centrado en las personas.
            </p>
            <p>
              En esta herramienta, utilizamos el término SDA (Sistema de Decisiones Automatizado) para referirnos a algoritmos, sistemas de inteligencia artificial o modelos de aprendizaje automático (machine learning) que intervienen en procesos de toma de decisiones, ya sea de forma automática o asistida. Elegimos este término para alinearnos con las Recomendaciones de Transparencia Algorítmica del Consejo para la Transparencia (CPLT), las cuales promueven su uso en el contexto nacional. Las preguntas del cuestionario incorporan y organizan los contenidos sugeridos por el CPLT, ayudando así a identificar áreas clave a transparentar y avanzar en el cumplimiento de buenas prácticas de gobernanza algorítmica.
            </p>
            <p>
              La herramienta está diseñada para ser utilizada con sistemas que ya han sido desarrollados y que se encuentran próximos a su implementación o etapa de pilotaje. El cuestionario consta de 47 preguntas agrupadas en 9 secciones. Se recomienda que sea completado por un equipo multidisciplinario que incluya perfiles como jefatura de proyecto, analistas o científicos de datos, responsables de datos, asesores legales, encargados de comunicaciones, y otros roles que la organización considere relevantes para reflejar adecuadamente el ciclo de vida del SDA.
            </p>
            <p>
              Esta herramienta se inspira en el enfoque de Model Cards for Model Reporting (Mitchell et al., 2019), adaptado tanto al contexto del sector público chileno con las <a href="https://www.consejotransparencia.cl/wp-content/uploads/destacados/2025/03/GUIA-Transparencia-Algoritmica_ene2025_v3.pdf-copia.pdf">Recomendaciones de Transparencia Algorítmica</a> como a los principios éticos y de transparencia que deben guiar el desarrollo y uso de sistemas algorítmicos en cualquier organización comprometida con el uso responsable de estas tecnologías.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-8">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="h-5 w-5" />
                <p>Todas las preguntas marcadas con un asterisco (*) son preguntas obligatorias. Al terminar de responder las preguntas, se debe marcar el botón “descargar ficha” para acceder a la ficha de transparencia en formato PDF.</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-8">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="h-5 w-5" />
                <p>Durante el uso de la herramienta, la información no es almacenada por la plataforma, para resguardar la privacidad de los datos que sean ingresados en los campos.</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <div className="flex items-center gap-2 text-blue-700">
              <Info className="h-5 w-5" />
              <p>Para obtener los mejores resultados, recomendamos que un equipo multidisciplinario participe en el proceso de completar esta ficha.</p>
            </div>
          </div>

          {/* Start Evaluation Form */}
          <form onSubmit={handleSubmit} className="bg-gray shadow-2xl shadow-inner rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Comienza tu Ficha de transparencia</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
                <Button type="submit" className="w-full">Iniciar Ficha de transparencia</Button>
              </div>
            </form>

            {/* Privacy Notice */}
            <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="font-semibold mb-2 text-gray-700">Aviso de Privacidad</h3>
              <p>
                La información ingresada en esta herramienta no es almacenada por la plataforma. 
                Todos los datos son procesados localmente en tu navegador para garantizar tu privacidad.
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}
