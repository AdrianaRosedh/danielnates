/**
 * Default footage for chapter (project) pages: the repo's own b&w
 * garden clips and stills pulled from them (public/media/stills).
 *
 * Used only when a project has no hero video/photo in Supabase — a
 * photo Daniel sets inline ("Cambiar foto") always wins.
 *
 * Each clip ships four encodes (see public/media/<clip>/):
 *   <clip>.av1.mp4            AV1, 1920×1080   (~0.1–1.0 MB)
 *   <clip>.mp4                H.264, 1920×1080 (fallback, ~0.3–2.0 MB)
 *   <clip>-portrait.av1.mp4   AV1, 608×1080 crop centred on the subject
 *   <clip>-portrait.mp4       H.264, same crop
 * Portrait screens get the 9:16 crop — a phone only ever shows the
 * middle third of a landscape frame, so it never downloads the rest.
 */
export interface VideoSource {
  src: string;
  type: string;
  media?: string;
}

export interface ChapterMedia {
  /** Ordered <source> list — the browser plays the first it can. */
  sources: VideoSource[];
  poster: string;
  /** Horizontal centre of the portrait crop, so the poster lines up. */
  portraitX: string;
}

const AV1 = 'video/mp4; codecs="av01.0.08M.08"';
const H264 = "video/mp4";
const PORTRAIT = "(max-aspect-ratio: 3/4)";

function clip(base: string): VideoSource[] {
  return [
    { src: `${base}-portrait.av1.mp4`, type: AV1, media: PORTRAIT },
    { src: `${base}-portrait.mp4`, type: H264, media: PORTRAIT },
    { src: `${base}.av1.mp4`, type: AV1 },
    { src: `${base}.mp4`, type: H264 },
  ];
}

const CHAPTER_MEDIA: Record<string, ChapterMedia> = {
  olivea:      { sources: clip("/media/olivea/olivea"),           poster: "/media/stills/olivea-poster.jpg",      portraitX: "45%" },
  fritanguita: { sources: clip("/media/fritanguita/fritanguita"), poster: "/media/stills/fritanguita-poster.jpg", portraitX: "42%" },
  maizal:      { sources: clip("/media/hero/hero"),               poster: "/media/stills/maizal-poster.jpg",      portraitX: "62%" },
};

export function chapterMedia(slug: string): ChapterMedia | null {
  return CHAPTER_MEDIA[slug] ?? null;
}
