// Minimal shims to keep typechecking lightweight in Lovable.
// These declarations intentionally use permissive types.

declare module 'html2canvas' {
  const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'jspdf' {
  export default class jsPDF {
    constructor(...args: any[]);
    internal: any;
    addImage(...args: any[]): any;
    addPage(...args: any[]): any;
    save(filename?: string): any;
    setFontSize(size: number): any;
    setFont(...args: any[]): any;
    setTextColor(...args: any[]): any;
    text(text: string | string[], x: number, y: number, options?: any): any;
    splitTextToSize(text: string, maxWidth: number, options?: any): string[];
    setDrawColor(...args: any[]): any;
    setFillColor(...args: any[]): any;
    rect(...args: any[]): any;
    line(...args: any[]): any;
    setLineWidth(width: number): any;
    getStringUnitWidth(text: string): number;
    [key: string]: any;
  }
  export { jsPDF };
}
