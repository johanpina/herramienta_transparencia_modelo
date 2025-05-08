'use client';

import { useRef, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';  

type Props = {
  targetId: string;           // id="ficha-preview"
  fileName?: string;
};

export function PdfExportButton({ targetId, fileName = 'ficha.pdf' }: Props) {
  /* 1. Creamos un ref “vacío”… */
  const contentRef = useRef<HTMLDivElement>(null);

  /* 2. …y en cuanto el botón se monta lo vinculamos al nodo real */
  useLayoutEffect(() => {
    contentRef.current = document.getElementById(targetId) as HTMLDivElement | null;
  }, [targetId]);

  /* 2. variables dinámicas --------------------------------------------- */
  const today = new Date();
  const year = today.getFullYear();                          // 2025 → 2026 …
  const elaborationDate = format(today, 'dd/MM/yyyy');       // 06/05/2025

  /* 3. Hook con la nueva API */
  const handlePrint = useReactToPrint({
    contentRef,   // ✅ ÚNICA clave (3.x)
    documentTitle: fileName.replace(/\.pdf$/, ''),
    pageStyle: `
      /* ------------------------------------------------------------------
        Plantillas de página
        ------------------------------------------------------------------*/
      @page:first {                       /* Portada */
        size: A4 portrait;
        margin: 10mm 10mm 22mm 10mm;      /* top | right | bottom | left */
      }

      @page {                             /* Resto de páginas */
        size: A4 portrait;
        margin: 20mm 10mm 22mm 10mm;      /* top DOBLE (40 mm) */
        
        /* --- Pie centrado, 2 líneas, numeración --- */
        @bottom-center {
          content:"Herramienta del GobLab UAI - Licencia MPL-2.0\\A"
                  "Genera tu ficha en: https://algoritmospublicos.cl/herramientas \\A"
                  "© ${year} Ficha de transparencia del modelo elaborada en ${elaborationDate}.";
                  
                  
          white-space: pre-line;          /* \\A → salto */
          font-size: 10pt;
          font-family: Helvetica, Arial, sans-serif;
          line-height: 1.4;
        }
      }

      /* ------------------------------------------------------------------
        Ajustes impresión globales
        ------------------------------------------------------------------*/
      @media print {
        html, body { width: 210mm; height: 297mm; }

        /* acolchado interior para que nada pegue al borde de la caja */
        #ficha-preview { padding: 8mm !important; }

        /* doble columna */
        .print-columns {
          column-gap: 18mm !important;
          column-fill: auto !important;
        }

      }
    `,
    
  });

  return (
    <Button onClick={handlePrint} className="mt-4">
      Exportar a PDF
    </Button>
  );
}