declare module 'opentype.js' {
  export interface Font {
    getPath(text: string, x: number, y: number, fontSize: number, options?: any): any;
    draw(ctx: any, text: string, x: number, y: number, fontSize: number, options?: any): void;
  }
  export function load(url: string, callback: (err: any, font: Font) => void): void;
  export function parse(buffer: ArrayBuffer): Font;
}

declare module 'xlsx';
