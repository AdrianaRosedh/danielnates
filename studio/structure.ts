import type {StructureResolver} from 'sanity/structure'
import {
  User,
  Settings,
  Layers,
  PenLine,
  Image as ImageIcon,
  StickyNote,
  Newspaper,
  FileText,
  CalendarDays,
} from 'lucide-react'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Ajustes del sitio')
        .icon(Settings)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings'),
        ),
      S.listItem()
        .title('Daniel')
        .icon(User)
        .child(S.document().schemaType('person').documentId('daniel')),
      S.listItem()
        .title('Prensa (kit)')
        .icon(FileText)
        .child(S.document().schemaType('pressKit').documentId('pressKit')),
      S.divider(),
      S.listItem()
        .title('Brief diario')
        .icon(CalendarDays)
        .child(S.documentTypeList('dailyBrief').title('Brief diario')),
      S.listItem()
        .title('Proyectos')
        .icon(Layers)
        .child(S.documentTypeList('project').title('Proyectos')),
      S.listItem()
        .title('Diario')
        .icon(PenLine)
        .child(S.documentTypeList('article').title('Diario')),
      S.listItem()
        .title('Arte')
        .icon(ImageIcon)
        .child(S.documentTypeList('artPiece').title('Arte')),
      S.listItem()
        .title('Field Notes')
        .icon(StickyNote)
        .child(S.documentTypeList('fieldNote').title('Field Notes')),
      S.listItem()
        .title('Press (menciones)')
        .icon(Newspaper)
        .child(S.documentTypeList('pressItem').title('Press menciones')),
    ])
