'use client';

/**
 * Exportación de la ficha: imprime el nodo `targetId` con react-to-print y el
 * usuario elige "Guardar como PDF" en el diálogo del navegador.
 *
 * `print-color-adjust: exact` en la hoja de impresión es lo que hace que los
 * fondos rosados y las reglas de la ficha lleguen al PDF; sin eso Chrome los
 * descarta y el documento sale en blanco y negro.
 */

import { useRef, useLayoutEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { T, MONO } from '@/lib/civic';
import { I } from '@/components/civic-icons';

type Props = {
  targetId: string;           // id="ficha-preview"
  fileName?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
};

export function PdfExportButton({ targetId, fileName = 'ficha.pdf', onBeforePrint, onAfterPrint }: Props) {
  /* Ref "vacío" que se enlaza al nodo real cuando el botón se monta. */
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    contentRef.current = document.getElementById(targetId) as HTMLDivElement | null;
  }, [targetId]);

  const today = new Date();
  const year = today.getFullYear();
  const elaborationDate = format(today, 'dd/MM/yyyy');
  const version = process.env.NEXT_PUBLIC_VERSION || '0.0.0';

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: fileName.replace(/\.pdf$/, ''),
    onBeforePrint: async () => { onBeforePrint?.(); },
    onAfterPrint: () => { onAfterPrint?.(); },
    pageStyle: `
      @page:first {                       /* Portada */
        size: A4 portrait;
        margin: 10mm 10mm 22mm 10mm;      /* top | right | bottom | left */
      }

      @page {                             /* Resto de páginas */
        size: A4 portrait;
        margin: 16mm 10mm 22mm 10mm;

        /* Pie centrado, tres líneas. */
        @bottom-center {
          content:"Herramienta del GobLab UAI - Licencia MPL-2.0. - Version V.${version}\\A"
                  "Genera tu ficha en: https://algoritmospublicos.cl/herramientas \\A"
                  "© ${year} Ficha de transparencia del modelo elaborada en ${elaborationDate}.";
          white-space: pre-line;          /* \\A → salto */
          font-size: 8pt;
          font-family: Helvetica, Arial, sans-serif;
          line-height: 1.4;
          color: #5A534C;
        }
      }

      @media print {
        html, body { width: 210mm; }

        /* Sin esto Chrome elimina los fondos y la ficha sale en blanco y negro. */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* La tarjeta ocupa la hoja: sin marco ni esquinas redondeadas. */
        #${targetId} {
          max-width: none !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          opacity: 1 !important;
        }

        /* Cuerpo a dos columnas. */
        .print-columns {
          column-count: 2 !important;
          column-gap: 12mm !important;
          column-fill: auto !important;
        }

        .no-print { display: none !important; }
      }
    `,
  });

  return (
    <button
      onClick={handlePrint}
      style={{
        padding: '10px 20px', background: T.burgundy, color: '#fff', border: 'none',
        borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        fontFamily: MONO, letterSpacing: 0.5,
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}
    >
      <I.download /> DESCARGAR PDF
    </button>
  );
}
