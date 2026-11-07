/**
 * Prepares a photo in the browser before the in-page editor uploads it.
 *
 * Phone photos are routinely 5–15 MB and 4000–8000 px: over the upload
 * limit, and far larger than any page shows. Every still photo is redrawn
 * at most PHOTO_MAX_EDGE px on its longest side and re-encoded (WebP where
 * the browser can encode it, else JPEG), stepping quality, then size, down
 * until it fits the upload budget.
 *
 * Redrawing also applies the camera's rotation and drops metadata such as
 * GPS location, which would otherwise be published along with the file.
 *
 * Browser-only (canvas, createImageBitmap).
 */
import { UPLOAD_MAX_BYTES, uploadExtension } from "./uploads";

/** Longest edge kept: a full-bleed photo on a 1440-px-wide 2× screen.
 *  Visitors get smaller variants from Vercel's optimizer (see img.ts). */
export const PHOTO_MAX_EDGE = 2880;

/** Headroom under the server cap for the multipart envelope. */
const BYTE_BUDGET = Math.floor(UPLOAD_MAX_BYTES * 0.9);
const QUALITY_STEPS = [0.86, 0.8, 0.72, 0.64] as const;
const EDGE_STEPS = [1, 0.75, 0.56] as const;

export type ImagePrepFailure = "unsupported" | "too-large";

export class ImagePrepError extends Error {
  constructor(readonly reason: ImagePrepFailure) {
    super(`image prep failed: ${reason}`);
    this.name = "ImagePrepError";
  }
}

let webpEncoding: Promise<boolean> | null = null;
/** Safari's canvas can't encode WebP (it silently returns PNG). */
function canEncodeWebp(): Promise<boolean> {
  webpEncoding ??= new Promise((resolve) => {
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    probe.toBlob((blob) => resolve(blob?.type === "image/webp"), "image/webp");
  });
  return webpEncoding;
}

async function decode(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Older engines reject the options bag; formats the browser can't
    // read at all (HEIC outside Safari) fail both ways.
    try {
      return await createImageBitmap(file);
    } catch {
      return null;
    }
  }
}

const encode = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const renamed = (name: string, type: string) =>
  `${name.replace(/\.[^./]+$/, "") || "foto"}.${uploadExtension(type) ?? "jpg"}`;

export async function prepareImageForUpload(file: File): Promise<File> {
  const accepted = file.size <= UPLOAD_MAX_BYTES && !!uploadExtension(file.type);

  // A GIF may be animated; redrawing would freeze it on one frame.
  if (file.type === "image/gif" && accepted) return file;

  const bitmap = await decode(file);
  if (!bitmap) {
    if (accepted) return file; // let the server decide
    throw new ImagePrepError("unsupported");
  }

  try {
    const type = (await canEncodeWebp()) ? "image/webp" : "image/jpeg";
    const fitScale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));

    // JPEG has no transparency: keep a PNG that already fits rather than
    // flattening it onto white.
    if (type === "image/jpeg" && file.type === "image/png" && accepted && fitScale === 1) return file;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (accepted) return file;
      throw new ImagePrepError("unsupported");
    }

    for (const edge of EDGE_STEPS) {
      // Resizing a canvas resets its context state, so set it every pass.
      canvas.width = Math.max(1, Math.round(bitmap.width * fitScale * edge));
      canvas.height = Math.max(1, Math.round(bitmap.height * fitScale * edge));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (type === "image/jpeg") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITY_STEPS) {
        const blob = await encode(canvas, type, quality);
        if (blob && blob.size <= BYTE_BUDGET) {
          return new File([blob], renamed(file.name, type), { type, lastModified: Date.now() });
        }
      }
    }
  } finally {
    bitmap.close();
  }

  throw new ImagePrepError("too-large");
}
