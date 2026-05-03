import {defineArrayMember, defineField, defineType} from 'sanity'

/* ── Hero ──────────────────────────────────────────────────────────── */
export const heroBlock = defineType({
  name: 'heroBlock',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({name: 'title', title: 'Título', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 2}),
    defineField({name: 'image', title: 'Imagen', type: 'image', options: {hotspot: true}}),
    defineField({name: 'videoUrl', title: 'Video URL (opcional)', type: 'url'}),
    defineField({
      name: 'tone',
      title: 'Tono',
      type: 'string',
      options: {
        list: [
          {title: 'Cinemático (oscuro + scrim)', value: 'cinematic'},
          {title: 'Limpio (claro)', value: 'clean'},
          {title: 'Marquee (kinético)', value: 'marquee'},
        ],
        layout: 'radio',
      },
      initialValue: 'cinematic',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'subtitle', media: 'image'}},
})

/* ── Rich Text ─────────────────────────────────────────────────────── */
export const richTextBlock = defineType({
  name: 'richTextBlock',
  title: 'Texto editorial',
  type: 'object',
  fields: [
    defineField({
      name: 'body',
      title: 'Cuerpo',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Cita', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Énfasis', value: 'em'},
              {title: 'Fuerte', value: 'strong'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {name: 'href', type: 'url', title: 'URL', validation: (r) => r.required()},
                  {name: 'newTab', type: 'boolean', title: 'Nueva pestaña', initialValue: true},
                ],
              },
            ],
          },
        },
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'maxWidth',
      title: 'Ancho de lectura',
      type: 'string',
      options: {
        list: [
          {title: 'Cómodo (60ch)', value: 'comfort'},
          {title: 'Editorial (72ch)', value: 'editorial'},
          {title: 'Ancho completo', value: 'full'},
        ],
        layout: 'radio',
      },
      initialValue: 'editorial',
    }),
  ],
  preview: {
    select: {body: 'body'},
    prepare({body}) {
      const first = Array.isArray(body) ? body.find((b: any) => b._type === 'block') : null
      const txt = first?.children?.map((c: any) => c?.text).join(' ') ?? 'Texto editorial'
      return {title: txt.slice(0, 80) || 'Texto editorial'}
    },
  },
})

/* ── Image ─────────────────────────────────────────────────────────── */
export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Imagen',
  type: 'object',
  fields: [
    defineField({name: 'image', title: 'Imagen', type: 'image', options: {hotspot: true}, validation: (r) => r.required()}),
    defineField({name: 'caption', title: 'Pie de foto', type: 'string'}),
    defineField({name: 'alt', title: 'Alt (accesibilidad)', type: 'string'}),
    defineField({
      name: 'layout',
      title: 'Diseño',
      type: 'string',
      options: {
        list: [
          {title: 'Ancho de columna', value: 'inline'},
          {title: 'Ancho completo', value: 'full'},
          {title: 'Bleed (sangrado total)', value: 'bleed'},
        ],
        layout: 'radio',
      },
      initialValue: 'inline',
    }),
  ],
  preview: {select: {title: 'caption', media: 'image'}},
})

/* ── Gallery ───────────────────────────────────────────────────────── */
export const galleryBlock = defineType({
  name: 'galleryBlock',
  title: 'Galería',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'caption', title: 'Pie de foto', type: 'string'},
            {name: 'alt', title: 'Alt', type: 'string'},
          ],
        }),
      ],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Disposición',
      type: 'string',
      options: {
        list: [
          {title: 'Cuadrícula', value: 'grid'},
          {title: 'Tira horizontal (scroll)', value: 'strip'},
          {title: 'Mosaico (masonry)', value: 'masonry'},
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
    }),
    defineField({name: 'caption', title: 'Pie general', type: 'string'}),
  ],
  preview: {
    select: {images: 'images', caption: 'caption'},
    prepare({images, caption}) {
      return {title: caption || 'Galería', subtitle: `${(images ?? []).length} imágenes`, media: images?.[0]}
    },
  },
})

/* ── Video ─────────────────────────────────────────────────────────── */
export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({name: 'videoUrl', title: 'URL del video (mp4 / mux / vimeo)', type: 'url', validation: (r) => r.required()}),
    defineField({name: 'poster', title: 'Imagen poster', type: 'image', options: {hotspot: true}}),
    defineField({name: 'caption', title: 'Pie de foto', type: 'string'}),
    defineField({name: 'autoplay', title: 'Autoplay (silencio)', type: 'boolean', initialValue: true}),
    defineField({name: 'loop', title: 'Loop', type: 'boolean', initialValue: true}),
    defineField({
      name: 'layout',
      title: 'Diseño',
      type: 'string',
      options: {
        list: [
          {title: 'Inline', value: 'inline'},
          {title: 'Ancho completo', value: 'full'},
          {title: 'Bleed', value: 'bleed'},
        ],
        layout: 'radio',
      },
      initialValue: 'full',
    }),
  ],
  preview: {select: {title: 'caption', media: 'poster'}},
})

/* ── Quote ─────────────────────────────────────────────────────────── */
export const quoteBlock = defineType({
  name: 'quoteBlock',
  title: 'Cita',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'Cita', type: 'text', rows: 3, validation: (r) => r.required()}),
    defineField({name: 'attribution', title: 'Atribución', type: 'string'}),
    defineField({
      name: 'tone',
      title: 'Estilo',
      type: 'string',
      options: {
        list: [
          {title: 'Editorial', value: 'editorial'},
          {title: 'Pull quote (grande)', value: 'pull'},
        ],
        layout: 'radio',
      },
      initialValue: 'editorial',
    }),
  ],
  preview: {
    select: {text: 'text', attribution: 'attribution'},
    prepare({text, attribution}) {
      return {title: text?.slice(0, 80) ?? 'Cita', subtitle: attribution}
    },
  },
})

/* ── Divider ───────────────────────────────────────────────────────── */
export const dividerBlock = defineType({
  name: 'dividerBlock',
  title: 'Separador',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Estilo',
      type: 'string',
      options: {
        list: [
          {title: 'Línea fina', value: 'rule'},
          {title: 'Punto (•)', value: 'dot'},
          {title: 'Espacio en blanco', value: 'space'},
        ],
        layout: 'radio',
      },
      initialValue: 'rule',
    }),
  ],
  preview: {prepare: () => ({title: '— Separador —'})},
})

/* ── Embed ─────────────────────────────────────────────────────────── */
export const embedBlock = defineType({
  name: 'embedBlock',
  title: 'Embed (YouTube / Spotify / Instagram)',
  type: 'object',
  fields: [
    defineField({name: 'url', title: 'URL', type: 'url', validation: (r) => r.required()}),
    defineField({name: 'caption', title: 'Pie de foto', type: 'string'}),
    defineField({
      name: 'aspect',
      title: 'Aspecto',
      type: 'string',
      options: {
        list: [
          {title: '16:9 (video)', value: '16x9'},
          {title: '9:16 (vertical)', value: '9x16'},
          {title: '1:1 (cuadrado)', value: '1x1'},
          {title: '4:5 (Instagram)', value: '4x5'},
        ],
        layout: 'radio',
      },
      initialValue: '16x9',
    }),
  ],
  preview: {select: {title: 'caption', subtitle: 'url'}},
})

/* ── CTA ───────────────────────────────────────────────────────────── */
export const ctaBlock = defineType({
  name: 'ctaBlock',
  title: 'Llamada a acción',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'Texto', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'href', title: 'URL', type: 'url', validation: (r) => r.required()}),
    defineField({name: 'secondaryLabel', title: 'Texto secundario', type: 'string'}),
    defineField({name: 'secondaryHref', title: 'URL secundaria', type: 'url'}),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

/* ── Marquee ───────────────────────────────────────────────────────── */
export const marqueeBlock = defineType({
  name: 'marqueeBlock',
  title: 'Marquee (texto kinético)',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'Texto', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'speed',
      title: 'Velocidad',
      type: 'string',
      options: {
        list: [
          {title: 'Lento', value: 'slow'},
          {title: 'Medio', value: 'medium'},
          {title: 'Rápido', value: 'fast'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),
  ],
  preview: {select: {title: 'text'}},
})

/* ────────────────────────────────────────────────────────────────────
   NEW BLOCKS — Recipe, Audio, Pillars, Split, Timeline, Accordion,
   FeaturedCards, Map, Stats, Code
   ──────────────────────────────────────────────────────────────────── */

export const recipeBlock = defineType({
  name: 'recipeBlock',
  title: 'Receta',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título de la receta', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'meta',
      title: 'Meta',
      type: 'object',
      fields: [
        defineField({name: 'time', title: 'Tiempo (min)', type: 'number'}),
        defineField({name: 'servings', title: 'Porciones', type: 'number'}),
        defineField({name: 'difficulty', title: 'Dificultad', type: 'string'}),
      ],
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredientes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'amount', title: 'Cantidad', type: 'string'}),
            defineField({name: 'item', title: 'Ingrediente', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'note', title: 'Nota', type: 'string'}),
          ],
          preview: {
            select: {amount: 'amount', item: 'item'},
            prepare: ({amount, item}) => ({title: [amount, item].filter(Boolean).join(' · ')}),
          },
        },
      ],
    }),
    defineField({
      name: 'steps',
      title: 'Procedimiento',
      type: 'array',
      of: [{type: 'block', styles: [{title: 'Normal', value: 'normal'}]}],
    }),
  ],
  preview: {select: {title: 'title'}, prepare: ({title}) => ({title: title ?? 'Receta'})},
})

export const audioBlock = defineType({
  name: 'audioBlock',
  title: 'Audio (voz / música)',
  type: 'object',
  fields: [
    defineField({name: 'audioUrl', title: 'URL del audio (mp3 / m4a)', type: 'url', validation: (r) => r.required()}),
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({name: 'caption', title: 'Pie / descripción', type: 'string'}),
    defineField({name: 'transcript', title: 'Transcripción (opcional)', type: 'text', rows: 6}),
  ],
  preview: {select: {title: 'title', subtitle: 'caption'}, prepare: ({title, subtitle}) => ({title: title ?? 'Audio', subtitle})},
})

export const pillarsBlock = defineType({
  name: 'pillarsBlock',
  title: 'Pilares (manifiesto)',
  type: 'object',
  fields: [
    defineField({name: 'kicker', title: 'Kicker', type: 'string'}),
    defineField({
      name: 'pillars',
      title: 'Pilares',
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
      validation: (r) => r.min(1).max(8),
    }),
  ],
  preview: {select: {pillars: 'pillars'}, prepare: ({pillars}) => ({title: 'Pilares', subtitle: `${(pillars ?? []).length}`})},
})

export const splitBlock = defineType({
  name: 'splitBlock',
  title: 'Doble columna',
  type: 'object',
  fields: [
    defineField({
      name: 'orientation',
      title: 'Orden',
      type: 'string',
      options: {
        list: [
          {title: 'Media a la izquierda · texto a la derecha', value: 'media-left'},
          {title: 'Texto a la izquierda · media a la derecha', value: 'media-right'},
        ],
        layout: 'radio',
      },
      initialValue: 'media-left',
    }),
    defineField({name: 'image', title: 'Imagen', type: 'image', options: {hotspot: true}}),
    defineField({name: 'videoUrl', title: 'O Video URL', type: 'url'}),
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Encabezado',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'string'}),
        defineField({name: 'en', title: 'EN', type: 'string'}),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Texto',
      type: 'object',
      fields: [
        defineField({name: 'es', title: 'ES', type: 'array', of: [{type: 'block'}]}),
        defineField({name: 'en', title: 'EN', type: 'array', of: [{type: 'block'}]}),
      ],
    }),
  ],
  preview: {select: {title: 'eyebrow', media: 'image'}, prepare: ({title, media}) => ({title: title ?? 'Doble columna', media})},
})

export const timelineBlock = defineType({
  name: 'timelineBlock',
  title: 'Línea de tiempo',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({
      name: 'entries',
      title: 'Entradas',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'year', title: 'Año / Fecha', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Título', type: 'string', validation: (r) => r.required()}),
            defineField({
              name: 'note',
              title: 'Nota',
              type: 'object',
              fields: [
                defineField({name: 'es', title: 'ES', type: 'text', rows: 2}),
                defineField({name: 'en', title: 'EN', type: 'text', rows: 2}),
              ],
            }),
          ],
          preview: {select: {year: 'year', label: 'label'}, prepare: ({year, label}) => ({title: label, subtitle: year})},
        },
      ],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {select: {title: 'title'}, prepare: ({title}) => ({title: title ?? 'Línea de tiempo'})},
})

export const accordionBlock = defineType({
  name: 'accordionBlock',
  title: 'Acordeón / FAQ',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'q',
              title: 'Pregunta / Encabezado',
              type: 'object',
              fields: [
                defineField({name: 'es', title: 'ES', type: 'string', validation: (r) => r.required()}),
                defineField({name: 'en', title: 'EN', type: 'string'}),
              ],
            }),
            defineField({
              name: 'a',
              title: 'Respuesta',
              type: 'object',
              fields: [
                defineField({name: 'es', title: 'ES', type: 'array', of: [{type: 'block'}]}),
                defineField({name: 'en', title: 'EN', type: 'array', of: [{type: 'block'}]}),
              ],
            }),
          ],
          preview: {select: {q: 'q.es'}, prepare: ({q}) => ({title: q ?? 'Item'})},
        },
      ],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {select: {title: 'title'}, prepare: ({title}) => ({title: title ?? 'Acordeón'})},
})

export const featuredCardsBlock = defineType({
  name: 'featuredCardsBlock',
  title: 'Tarjetas destacadas',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título de la sección', type: 'string'}),
    defineField({
      name: 'cards',
      title: 'Tarjetas',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Título', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'description', title: 'Descripción', type: 'text', rows: 2}),
            defineField({name: 'image', title: 'Imagen', type: 'image', options: {hotspot: true}}),
            defineField({name: 'href', title: 'URL', type: 'string'}),
            defineField({name: 'tag', title: 'Tag', type: 'string'}),
          ],
          preview: {select: {title: 'title', subtitle: 'tag', media: 'image'}},
        },
      ],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {select: {title: 'title'}, prepare: ({title}) => ({title: title ?? 'Tarjetas destacadas'})},
})

export const mapBlock = defineType({
  name: 'mapBlock',
  title: 'Mapa / Ubicación',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({name: 'address', title: 'Dirección', type: 'string'}),
    defineField({name: 'lat', title: 'Latitud', type: 'number'}),
    defineField({name: 'lng', title: 'Longitud', type: 'number'}),
    defineField({name: 'zoom', title: 'Zoom', type: 'number', initialValue: 14}),
    defineField({name: 'mapsUrl', title: 'Link a Google Maps', type: 'url'}),
  ],
  preview: {select: {title: 'title', subtitle: 'address'}, prepare: ({title, subtitle}) => ({title: title ?? 'Mapa', subtitle})},
})

export const statsBlock = defineType({
  name: 'statsBlock',
  title: 'Métricas',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string'}),
    defineField({
      name: 'stats',
      title: 'Métricas',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'value', title: 'Valor', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'label', title: 'Etiqueta', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'note', title: 'Nota', type: 'string'}),
          ],
          preview: {select: {value: 'value', label: 'label'}, prepare: ({value, label}) => ({title: value, subtitle: label})},
        },
      ],
      validation: (r) => r.min(1).max(6),
    }),
  ],
  preview: {select: {title: 'title'}, prepare: ({title}) => ({title: title ?? 'Métricas'})},
})

export const codeBlock = defineType({
  name: 'codeBlock',
  title: 'Código / Pre-formato',
  type: 'object',
  fields: [
    defineField({name: 'language', title: 'Lenguaje', type: 'string', initialValue: 'text'}),
    defineField({name: 'caption', title: 'Pie de foto', type: 'string'}),
    defineField({name: 'code', title: 'Código', type: 'text', rows: 12, validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'caption', subtitle: 'language'}, prepare: ({title, subtitle}) => ({title: title ?? 'Código', subtitle})},
})

/* ── Page builder array ────────────────────────────────────────────── */
export const pageBuilder = {
  name: 'blocks',
  title: 'Bloques',
  type: 'array',
  of: [
    {type: 'heroBlock'},
    {type: 'richTextBlock'},
    {type: 'imageBlock'},
    {type: 'galleryBlock'},
    {type: 'videoBlock'},
    {type: 'quoteBlock'},
    {type: 'dividerBlock'},
    {type: 'embedBlock'},
    {type: 'ctaBlock'},
    {type: 'marqueeBlock'},
    {type: 'recipeBlock'},
    {type: 'audioBlock'},
    {type: 'pillarsBlock'},
    {type: 'splitBlock'},
    {type: 'timelineBlock'},
    {type: 'accordionBlock'},
    {type: 'featuredCardsBlock'},
    {type: 'mapBlock'},
    {type: 'statsBlock'},
    {type: 'codeBlock'},
  ],
} as const

export const blockObjects = [
  heroBlock,
  richTextBlock,
  imageBlock,
  galleryBlock,
  videoBlock,
  quoteBlock,
  dividerBlock,
  embedBlock,
  ctaBlock,
  marqueeBlock,
  recipeBlock,
  audioBlock,
  pillarsBlock,
  splitBlock,
  timelineBlock,
  accordionBlock,
  featuredCardsBlock,
  mapBlock,
  statsBlock,
  codeBlock,
]
