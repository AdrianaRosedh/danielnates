/**
 * Upload rules shared by the upload endpoint (server) and the in-page
 * editor (browser), so the limit the editor shrinks photos to is always
 * the limit the server enforces.
 *
 * Browser-safe: no server-only imports.
 */

/** Vercel caps a function request body at 4.5 MB; 4 MB leaves room for
 *  the multipart envelope. The storage bucket has its own, larger cap. */
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

/** Allowlisted content type → stored extension. The client's file name
 *  and MIME are never trusted for the stored object: no SVG/HTML (stored
 *  XSS on the public bucket), extension derived from the allowlisted type. */
export const UPLOAD_TYPES: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};

export const uploadExtension = (type: string): string | undefined =>
  Object.hasOwn(UPLOAD_TYPES, type) ? UPLOAD_TYPES[type] : undefined;

export const formatMegabytes = (bytes: number): string =>
  `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
