import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'fieldNote',
  title: 'Field Notes',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string', validation: (r) => r.required()}),

    defineField({
      name: 'date',
      title: 'Fecha',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          {title: 'Ingrediente', value: 'ingredient'},
          {title: 'Territorio', value: 'territory'},
          {title: 'Técnica', value: 'technique'},
          {title: 'Influencia (arte/música/moda)', value: 'influence'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'body',
      title: 'Texto',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'array', of: [{type: 'block'}], validation: (r) => r.required()}),
        defineField({name: 'en', title: 'EN', type: 'array', of: [{type: 'block'}]}),
      ],
    }),

    defineField({
      name: 'externalLink',
      title: 'Link externo (opcional)',
      type: 'url',
      description: 'Enlace al Journal de Olivea si aplica.',
    }),
  ],
})