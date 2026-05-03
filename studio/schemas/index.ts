import person from './person'
import project from './project'
import fieldNote from './fieldNote'
import pressItem from './pressItem'
import siteSettings from './documents/siteSettings'
import article from './documents/article'
import artPiece from './documents/artPiece'
import pressKit from './documents/pressKit'
import dailyBrief from './documents/dailyBrief'
import voiceTrack from './objects/voiceTrack'
import {blockObjects} from './objects/blocks'

export const schemaTypes = [
  // Singletons
  siteSettings,
  person,
  pressKit,
  // Documents
  project,
  article,
  artPiece,
  dailyBrief,
  fieldNote,
  pressItem,
  // Objects (page builder blocks)
  ...blockObjects,
  // Reusable objects
  voiceTrack,
]
