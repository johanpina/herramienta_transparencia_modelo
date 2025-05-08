"use client"

import React, { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, ChevronLeft, HelpCircle, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface InfoSidebarProps {
  isSidebarOpen: boolean
  setIsSidebarOpen: (o: boolean) => void
  feedback: string
  setFeedback: (v: string) => void
  organization: string
  setOrganization: (v: string) => void
}

export function InfoSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  feedback,
  setFeedback,
  organization,
  setOrganization,
}: InfoSidebarProps) {
  const [category, setCategory] = useState("general")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();                // ← evita navegación
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "FichaTransparencia",
          category,
          subject: `Feedback ${category}`,
          message: feedback,
          organization,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast({
              title: "Feedback enviado",
              description: "¡Gracias por tu feedback!",
            });
      setSent(true);
      /* limpiar */
      setFeedback("");
      setOrganization("");
      setCategory("general");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setSubmitting(false);
    }
  }



  return (
    <div className={`bg-gray-100 shadow-lg transition-all ${isSidebarOpen ? "w-96" : "w-0 overflow-hidden"}`}>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Información</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* -------- FORMULARIO que llama /api/feedback ---------- */}
          {sent && (
            <Alert
              variant="default"
              className="mb-2 flex items-start gap-2 bg-green-50 text-green-800"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
              <AlertDescription>¡Gracias por tu feedback! Lo hemos recibido.</AlertDescription>
            </Alert>
          )}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gray-50 p-4 rounded-lg"
          >
            <h3 className="font-semibold flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              Feedback
            </h3>

            {/* Organización */}
            <Input
              name="organization"
              placeholder="Organización (opcional)"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              maxLength={150}
            />

            {/* Categoría */}
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría</label>
              {/* se envía en “category” */}
              <Select value={category} onValueChange={setCategory} name="category">
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Comentario general</SelectItem>
                  <SelectItem value="bug">Reporte de error</SelectItem>
                  <SelectItem value="feature">Sugerencia de mejora</SelectItem>
                  <SelectItem value="question">Pregunta</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mensaje */}
            <Textarea
              name="message"
              placeholder="Comparte tus comentarios aquí"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />

            {/* asunto opcional */}
            <input type="hidden" name="subject" value={`Feedback ${category}`} />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Enviando…" : <><Send className="mr-2 h-4 w-4" /> Enviar Feedback</>}
            </Button>
          </form>

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

