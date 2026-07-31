import './globals.css'
//import '../styles/print-styles.css'
import '@/styles/print-fixes.css';
import type { Metadata } from 'next'
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import Script from 'next/script'

// Tipografías del sistema "Civic Rose" (ver src/lib/civic.ts): Inter para el
// cuerpo, Fraunces para los titulares y JetBrains Mono para rótulos y cifras.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-fraunces' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Herramienta de Transparencia',
  description: 'Una herramienta para la elaboración de fichas de transparencia para sistemas de decisiones automatizadas o semiautomatizadas.',
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: true });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} ${inter.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}