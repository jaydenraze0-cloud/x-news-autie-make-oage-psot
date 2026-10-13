import { toBlob, toPng } from 'html-to-image';
import { MONTSERRAT_FONT_EMBED_CSS } from './fontEmbed';

const TRANSPARENT_1X1_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAAElFTkSuQmCC';

const DEFAULT_EXPORT_OPTIONS = {
  skipFonts: true, // Prevents reading external cross-origin stylesheets that cause SecurityError
  fontEmbedCSS: MONTSERRAT_FONT_EMBED_CSS, // Inlines local Montserrat font directly into the canvas SVG
  imagePlaceholder: TRANSPARENT_1X1_PNG,
  onImageErrorHandler: () => TRANSPARENT_1X1_PNG,
  cacheBust: false,
  width: 1080,
  height: 1080,
  pixelRatio: 1,
  style: {
    transform: 'none',
    transformOrigin: '0 0',
  },
};

/**
 * Exports 1080x1080 canvas element safely to Blob without CSSRules or tainted canvas crashes.
 */
export async function exportCanvasToBlob(element: HTMLElement): Promise<Blob> {
  if (!element) {
    throw new Error('Target canvas element not found');
  }

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {
    // Non-fatal
  }

  try {
    const blob = await toBlob(element, DEFAULT_EXPORT_OPTIONS);
    if (!blob) {
      throw new Error('toBlob returned empty result');
    }
    return blob;
  } catch (err: any) {
    console.warn('[Stark-News Export] toBlob failed, attempting toPng fallback:', err);
    try {
      const dataUrl = await toPng(element, DEFAULT_EXPORT_OPTIONS);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (!blob) throw new Error('toPng fallback failed');
      return blob;
    } catch (fallbackErr: any) {
      const msg = fallbackErr?.message || (typeof fallbackErr === 'string' ? fallbackErr : 'Canvas export failed');
      throw new Error(msg);
    }
  }
}

/**
 * Exports 1080x1080 canvas element safely to PNG data URL.
 */
export async function exportCanvasToPng(element: HTMLElement): Promise<string> {
  if (!element) {
    throw new Error('Target canvas element not found');
  }

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {
    // Non-fatal
  }

  try {
    return await toPng(element, DEFAULT_EXPORT_OPTIONS);
  } catch (err: any) {
    console.warn('[Stark-News Export] toPng primary attempt failed, retrying:', err);
    return await toPng(element, {
      ...DEFAULT_EXPORT_OPTIONS,
      filter: (node) => !(node instanceof HTMLScriptElement),
    });
  }
}
