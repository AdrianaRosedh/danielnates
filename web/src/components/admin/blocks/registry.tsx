/**
 * Maps block _type → editor component.
 *
 * Kept separate from blocks-meta.ts so that lib code (which is also
 * imported by Astro server pages) doesn't pull in the React tree.
 */
import type { ComponentType } from "react";
import type { PageBlock } from "../../../lib/types";
import type { BlockEditorProps } from "./_shared";

import HeroEditor from "./HeroEditor";
import RichTextEditor from "./RichTextEditor";
import QuoteEditor from "./QuoteEditor";
import MarqueeEditor from "./MarqueeEditor";
import ImageEditor from "./ImageEditor";
import GalleryEditor from "./GalleryEditor";
import VideoEditor from "./VideoEditor";
import AudioEditor from "./AudioEditor";
import EmbedEditor from "./EmbedEditor";
import SplitEditor from "./SplitEditor";
import DividerEditor from "./DividerEditor";
import CtaEditor from "./CtaEditor";
import PillarsEditor from "./PillarsEditor";
import TimelineEditor from "./TimelineEditor";
import StatsEditor from "./StatsEditor";
import FeaturedCardsEditor from "./FeaturedCardsEditor";
import RecipeEditor from "./RecipeEditor";
import AccordionEditor from "./AccordionEditor";
import MapEditor from "./MapEditor";
import CodeEditor from "./CodeEditor";

type EditorComponent<T> = ComponentType<BlockEditorProps<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EDITORS: Record<PageBlock["_type"], EditorComponent<any>> = {
  heroBlock: HeroEditor,
  richTextBlock: RichTextEditor,
  quoteBlock: QuoteEditor,
  marqueeBlock: MarqueeEditor,
  imageBlock: ImageEditor,
  galleryBlock: GalleryEditor,
  videoBlock: VideoEditor,
  audioBlock: AudioEditor,
  embedBlock: EmbedEditor,
  splitBlock: SplitEditor,
  dividerBlock: DividerEditor,
  ctaBlock: CtaEditor,
  pillarsBlock: PillarsEditor,
  timelineBlock: TimelineEditor,
  statsBlock: StatsEditor,
  featuredCardsBlock: FeaturedCardsEditor,
  recipeBlock: RecipeEditor,
  accordionBlock: AccordionEditor,
  mapBlock: MapEditor,
  codeBlock: CodeEditor,
};
