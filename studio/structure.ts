import type {StructureResolver} from 'sanity/desk'
import {User} from 'lucide-react'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Daniel')
        .icon(User)
        .child(S.document().schemaType('person').documentId('daniel')),
      S.divider(),
      ...S.documentTypeListItems().filter((i) => (i.getId?.() ?? '') !== 'person'),
    ])