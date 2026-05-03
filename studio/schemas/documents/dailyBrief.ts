import {defineField, defineType} from 'sanity'

/**
 * Daily Brief — one entry per day. The site's return-visit engine.
 *
 * Daniel posts one image + one line + (optional) a voice clip. Less than
 * 30 seconds in Sanity. Everything else stays minimal on purpose.
 */
export default defineType({
  name: 'dailyBrief',
  title: 'Brief diario',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Fecha',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'line',
      title: 'Una línea',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'string'}),
        defineField({name: 'en', title: 'EN', type: 'string'}),
      ],
    }),
    defineField({
      name: 'place',
      title: 'Lugar (opcional)',
      type: 'string',
      description: 'Olivea · Fritanguita · Atelier · Casa · etc.',
    }),
    defineField({
      name: 'voice',
      title: 'Voz (opcional)',
      type: 'voiceTrack',
    }),
  ],
  orderings: [
    {
      title: 'Más reciente primero',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
  ],
  preview: {
    select: {date: 'date', line: 'line.es', media: 'image'},
    prepare: ({date, line, media}) => ({
      title: line ?? '(sin línea)',
      subtitle: date,
      media,
    }),
  },
})
