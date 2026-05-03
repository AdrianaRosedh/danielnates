import {defineField, defineType} from 'sanity'

/**
 * Reusable voice-narration object. Attach to any document where Daniel
 * wants to speak in his own voice over a chapter.
 *
 * Two URLs (ES + EN). Either may be empty.
 * Audio can be uploaded to any host (Sanity assets, Cloudflare R2, S3, etc.)
 * and the URL pasted here.
 */
export default defineType({
  name: 'voiceTrack',
  title: 'Voz (narración)',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Audio · ES',
      type: 'url',
      description: 'URL del audio en español (mp3 / m4a / wav).',
    }),
    defineField({
      name: 'en',
      title: 'Audio · EN',
      type: 'url',
      description: 'URL del audio en inglés.',
    }),
    defineField({
      name: 'caption',
      title: 'Pie / contexto (opcional)',
      type: 'string',
    }),
  ],
  preview: {
    select: {es: 'es', en: 'en'},
    prepare({es, en}) {
      const langs = [es && 'ES', en && 'EN'].filter(Boolean).join(' · ')
      return {title: 'Voz', subtitle: langs || 'sin audio'}
    },
  },
})
