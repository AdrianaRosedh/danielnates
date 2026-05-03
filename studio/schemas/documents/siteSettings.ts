import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Ajustes del sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título interno',
      type: 'string',
      initialValue: 'Daniel Nates',
      readOnly: true,
    }),
    defineField({
      name: 'siteName',
      title: 'Nombre del sitio',
      type: 'string',
      initialValue: 'Daniel Nates',
    }),
    defineField({
      name: 'description',
      title: 'Descripción (SEO por defecto)',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'text', rows: 2}),
        defineField({name: 'en', title: 'EN', type: 'text', rows: 2}),
      ],
    }),
    defineField({
      name: 'defaultOg',
      title: 'Imagen Open Graph por defecto',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'navigation',
      title: 'Navegación principal',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'label', title: 'Etiqueta', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'href', title: 'URL', type: 'string', validation: (r) => r.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        },
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Pie de página',
      type: 'object',
      fields: [
        defineField({
          name: 'note',
          title: 'Nota',
          type: 'object',
          fields: [
            defineField({name: 'es', title: 'ES', type: 'text', rows: 2}),
            defineField({name: 'en', title: 'EN', type: 'text', rows: 2}),
          ],
        }),
        defineField({
          name: 'links',
          title: 'Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({name: 'label', title: 'Etiqueta', type: 'string'}),
                defineField({name: 'href', title: 'URL', type: 'string'}),
              ],
              preview: {select: {title: 'label', subtitle: 'href'}},
            },
          ],
        }),
      ],
    }),
  ],
})
