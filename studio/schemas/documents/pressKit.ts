import {defineField, defineType} from 'sanity'

/**
 * Press Kit — singleton. The /prensa page reads this.
 * Editable surfaces:
 *   - bio in three lengths (one-line, paragraph, long)
 *   - downloadable headshots / press photos
 *   - a short list of recognitions (Michelin, S.Pellegrino, F&W…)
 *   - a downloadable press PDF (file)
 *   - press email (overrides Daniel.social.email if set)
 */
export default defineType({
  name: 'pressKit',
  title: 'Prensa (kit)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título interno',
      type: 'string',
      initialValue: 'Press Kit',
      readOnly: true,
    }),

    defineField({
      name: 'bioOneLine',
      title: 'Bio · una línea',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'string'}),
        defineField({name: 'en', title: 'EN', type: 'string'}),
      ],
    }),
    defineField({
      name: 'bioShort',
      title: 'Bio · párrafo (≈ 60 palabras)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 4}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 4}),
      ],
    }),
    defineField({
      name: 'bioLong',
      title: 'Bio · larga (editorial)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'array', of: [{type: 'block'}]}),
        defineField({name: 'en', title: 'EN', type: 'array', of: [{type: 'block'}]}),
      ],
    }),

    defineField({
      name: 'photos',
      title: 'Fotografías (alta resolución)',
      description: 'Imágenes para descarga — retratos, plato, kitchen.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'caption', title: 'Pie de foto', type: 'string'},
            {name: 'credit', title: 'Crédito', type: 'string'},
          ],
        },
      ],
    }),

    defineField({
      name: 'recognitions',
      title: 'Reconocimientos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'year', title: 'Año', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Reconocimiento', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'org', title: 'Otorgado por', type: 'string'}),
            defineField({name: 'url', title: 'URL (opcional)', type: 'url'}),
          ],
          preview: {
            select: {year: 'year', label: 'label', org: 'org'},
            prepare: ({year, label, org}) => ({title: label, subtitle: [year, org].filter(Boolean).join(' · ')}),
          },
        },
      ],
    }),

    defineField({
      name: 'mentions',
      title: 'Menciones de prensa',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'outlet', title: 'Medio', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'title', title: 'Título', type: 'string'}),
            defineField({name: 'url', title: 'URL', type: 'url', validation: (r) => r.required()}),
            defineField({name: 'date', title: 'Fecha', type: 'date'}),
            defineField({name: 'language', title: 'Idioma', type: 'string', options: {list: ['es', 'en']}}),
          ],
          preview: {
            select: {outlet: 'outlet', title: 'title', date: 'date'},
            prepare: ({outlet, title, date}) => ({title: outlet, subtitle: [date, title].filter(Boolean).join(' · ')}),
          },
        },
      ],
    }),

    defineField({
      name: 'pressPdf',
      title: 'PDF descargable (kit completo)',
      type: 'file',
      options: {accept: 'application/pdf'},
    }),

    defineField({
      name: 'pressEmail',
      title: 'Email de prensa',
      type: 'string',
      description: 'Si se deja vacío, usa el email de Daniel.',
    }),
  ],
})
