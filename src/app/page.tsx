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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      localStorage.setItem('userEmail', email)
      const savedAnswers = localStorage.getItem(`answers_${email}`)
      if (savedAnswers) {
        localStorage.setItem('currentAnswers', savedAnswers)
      }
      router.push('/tool')
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
              src="/images/Logo_herramientas_algoritmos.png"
              alt="Herramientas Algoritmos Éticos"
              width={300}
              height={80}
            />
            <Image
              src="/images/logo-goblab-uai.png"
              alt="Gob Lab UAI"
              width={300}
              height={80}
            />
          </div>

          {/* Version */}
          <div className="text-sm text-gray-600">V.3.0.2</div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6">
          Ficha de transparencia del modelo. 
          </h1>

          {/* Description */}
          <div className="space-y-4 mb-8 text-gray-700">
            <p>
            La presente herramienta es un apoyo para la elaboración de una ficha de transparencia para sistemas de decisiones automatizadas o semiautomatizadas (SDA), con el propósito de ayudar a los organismos públicos a cumplir con los estándares de transparencia algorítmica de sus sistemas.
            </p>
            <p>
            Está destinada para ser utilizada en SDA que hayan completado la fase de desarrollo y evaluación, antes de la fase de implementación de la solución. Para más información sobre las fases, consultar la Guía Permitido Innovar (<Link href='https://www.lab.gob.cl/permitido-innovar' className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">https://www.lab.gob.cl/permitido-innovar</Link>). La ficha de transparencia es un documento que proporciona información relevante sobre la naturaleza, aspectos técnicos, funcionales y del proyecto del SDA. Desempeña un papel fundamental en la promoción de la transparencia, la rendición de cuentas y el uso ético de los algoritmos. La herramienta facilita la creación de esta ficha: ayuda a la identificación de la información relevante sobre el SDA que se debe transparentar y la presenta de manera clara, visible y comprensible tanto para los involucrados en el proceso institucional como para cualquier persona interesada.
            </p>
            <p>
            La herramienta consta de un total de 44 preguntas distribuidas en 9 secciones. Para completar adecuadamente todos los campos de la ficha, se requiere la participación de un equipo multidisciplinario de la institución, que incluya roles como el jefe de proyecto, analista de datos, responsable de datos, equipo legal, y encargado de comunicaciones y todos los demás que considere la institución.
            </p>
            <p>
            Esta herramienta se basa en el enfoque de Model Cards for Model Reporting (Mitchell, 2019).
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
