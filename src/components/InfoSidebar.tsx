import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, HelpCircle, Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface InfoSidebarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
  feedback: string
  setFeedback: (feedback: string) => void
  organization: string
  setOrganization: (organization: string) => void
}

export function InfoSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  feedback,
  setFeedback,
  organization,
  setOrganization
}: InfoSidebarProps) {
  return (
    <div
      className={`bg-gray-100 shadow-lg transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-96' : 'w-0'
      }`}
    >
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Información</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Separator />
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              Feedback
            </h3>
            <Input
              placeholder="Organización"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              maxLength={150}
            />
            <Textarea
              placeholder="Comparte tus comentarios o sugerencias aquí"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" /> Enviar Feedback
            </Button>
          </div>
          <Separator />
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold">Agradecimientos</h3>
            <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
              <Image
                src="/images/ANID.png"
                alt="Agencia Nacional de Investigación y Desarrollo"
                width={150}
                height={50}
              />
              <p className="break-words overflow-wrap">Subdirección de Investigación Aplicada/Concurso IDeA I+D 2023 proyecto ID23I10357</p>
            </div>

            <h3 className="font-semibold">Exención de responsabilidad</h3>
            <div className="bg-gray-50 p-4 rounded-lg backdrop-blur-sm">
              <p className="break-words overflow-wrap">
                La ficha de transparencia es como su nombre lo indica, una herramienta desarrollada para apoyar la transparencia en la implementación de modelos de ciencia de datos e inteligencia artificial (IA). La ficha está diseñada únicamente como un soporte para quienes buscan entregar mayor información a sus usuarios o al público sobre el desarrollo de sus modelos, con el fin de fomentar la explicabilidad de las decisiones que utilizan IA o ciencia de datos. Esta es una herramienta de referencia, que debe ser completada con la información requerida por los encargados de las instituciones que la utilizarán.
              </p>
              <p className="break-words overflow-wrap">
                La Universidad Adolfo Ibáñez (UAI) no ofrece garantías sobre el funcionamiento o el desempeño de los sistemas de ciencia de datos e IA que utilicen esta ficha. La Universidad no es responsable de ningún tipo de daño directo, indirecto, incidental, especial o consecuente, ni de pérdidas de beneficios que puedan surgir directa o indirectamente de la aplicación de la ficha en el uso o la confianza en los resultados obtenidos a través de esta herramienta.
              </p>
              <p className="break-words overflow-wrap">
                El empleo de las herramientas desarrolladas por la Universidad no implica ni constituye un sello ni certificado de aprobación por parte de la Universidad Adolfo Ibáñez respecto al cumplimiento legal, ético o funcional de un algoritmo de inteligencia artificial. La Universidad Adolfo Ibáñez no se hace responsable de la implementación de los algoritmos de inteligencia artificial que utilicen esta ficha, ni de las decisiones que se tomen en base a la información proporcionada por la misma.               
              </p>
              <p className="break-words overflow-wrap">
                Aquellos interesados en ser considerados como un caso de éxito mediante el uso de estas herramientas de IA responsable deben inscribirse en los pilotos a través del formulario <Link href="https://algoritmospublicos.cl/quiero_participar" className='text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500'>https://algoritmospublicos.cl/quiero_participar</Link> Es importante destacar que el uso de nuestras herramientas y los resultados derivados de las mismas no aseguran por sí mismos que un algoritmo cumpla con los estándares éticos requeridos.              
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

