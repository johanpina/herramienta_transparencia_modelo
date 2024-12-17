/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'html2pdf.js' {
  const html2pdf: {
    (): {
      from: (element: HTMLElement) => {
        save: (filename?: string) => void;
      };
    };
  };
  export default html2pdf;
}
/* eslint-enable @typescript-eslint/no-explicit-any */