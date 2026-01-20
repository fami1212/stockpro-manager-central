// Minimal shims to keep typechecking lightweight in Lovable.
// These declarations intentionally use permissive types.

declare module 'html2canvas' {
  const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    addImage(...args: any[]): any;
    save(filename?: string): any;
  }
}
