// Reads the caption written into a photo's metadata (IPTC / XMP), at build time.
// Lightroom, Photo Mechanic and Bridge write the caption to IPTC "Caption-Abstract"
// and XMP "dc:description"; this checks both, plus EXIF ImageDescription.
import exifr from 'exifr';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Where the gallery paths ('/images/galleries/...') live on disk.
// The first folder that contains the file wins; adjust if your images live elsewhere.
const ROOTS = ['src/assets', 'src', 'public'].map((dir) => path.resolve(dir));

const cache = new Map<string, string | undefined>();

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// XMP language alternatives come back as a string, an object or a list of them
const toText = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return toText(value[0]);
  if (typeof value === 'object' && 'value' in value) {
    return toText((value as { value: unknown }).value);
  }
  return undefined;
};

/** The caption from the file's metadata, HTML-escaped, or undefined if there is none. */
export async function readCaption(src: string): Promise<string | undefined> {
  if (cache.has(src)) return cache.get(src);

  const relative = src.replace(/^\/+/, '');
  const file = ROOTS.map((root) => path.join(root, relative)).find(existsSync);

  let caption: string | undefined;
  if (file) {
    try {
      // IFD0 (with EXIF ImageDescription) is always read by exifr, so it needs no option
      const data = await exifr.parse(file, {
        iptc: true,
        xmp: true,
        exif: false,
        gps: false,
      });
      const text =
        toText(data?.Caption) ??
        toText(data?.description) ??
        toText(data?.ImageDescription);
      // Captions are written English first, French on a new line, and the first sentence
      // describes the photo: keep the first line, then its first sentence
      const firstLine = text
        ?.split(/\r\n|\r|\n|\u2028|\u2029/)
        .map((line) => line.trim())
        .find(Boolean);
      // A sentence ends at . ! or ? followed by a space and a capital letter (or the end)
      const firstSentence =
        firstLine?.match(/^.+?[.!?](?=\s+[A-ZÀ-Ý"'«]|$)/)?.[0] ?? firstLine;
      caption = firstSentence ? escapeHtml(firstSentence) : undefined;
    } catch {
      caption = undefined; // unreadable metadata: no caption rather than a broken build
    }
  }

  cache.set(src, caption);
  return caption;
}
