import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'person',
  title: 'Daniel',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título interno',
      type: 'string',
      initialValue: 'Daniel Nates',
      readOnly: true,
    }),

    defineField({name: 'name', title: 'Nombre', type: 'string', validation: (r) => r.required()}),

    defineField({
      name: 'tagline',
      title: 'Línea principal (Hero)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'string', validation: (r) => r.required()}),
        defineField({name: 'en', title: 'EN', type: 'string'}),
      ],
    }),

    defineField({
      name: 'subline',
      title: 'Línea secundaria (Hero)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'string'}),
        defineField({name: 'en', title: 'EN', type: 'string'}),
      ],
    }),

    defineField({
      name: 'portrait',
      title: 'Retrato',
      type: 'image',
      options: {hotspot: true},
    }),

    defineField({
      name: 'bioShort',
      title: 'Bio corta',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 3}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 3}),
      ],
    }),

    defineField({
      name: 'bioLong',
      title: 'Bio larga (editorial)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'array', of: [{type: 'block'}]}),
        defineField({name: 'en', title: 'EN', type: 'array', of: [{type: 'block'}]}),
      ],
    }),

    defineField({
      name: 'pillars',
      title: 'Pilares',
      description: 'Frases cortas (máx 6).',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Etiqueta', type: 'string', validation: (r) => r.required()}),
            defineField({
              name: 'copy',
              title: 'Texto',
              type: 'object',
              fields: [
                defineField({name: 'es', title: 'ES', type: 'text', rows: 2}),
                defineField({name: 'en', title: 'EN', type: 'text', rows: 2}),
              ],
            }),
          ],
          preview: {select: {title: 'label'}},
        },
      ],
      validation: (r) => r.max(6),
    }),

    defineField({
      name: 'social',
      title: 'Redes',
      type: 'object',
      fields: [
        defineField({name: 'oliveaInstagram', title: 'Instagram Olivea', type: 'url'}),
        defineField({name: 'fritanguitaInstagram', title: 'Instagram Fritanguita', type: 'url'}),
        defineField({name: 'email', title: 'Email (Press/Collabs)', type: 'string'}),
      ],
    }),
  ],
})