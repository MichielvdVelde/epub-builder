import { EpubStructure } from "../generate/types";
import { Log } from "../log";
import type { Step } from "../pipeline";
import {
  ChapterNode,
  CssNode,
  FontNode,
  ImageNode,
  MetadataNode,
  Node,
  NodeType,
  RefNode,
  SpineNode,
} from "../types";

/**
 * A renderer function that takes a view and returns a string.
 * @template View The view type.
 * @param view The view to render.
 */
export interface Renderer<View> {
  (view: View): Promise<string>;
  /** The filename of the template. */
  filename?: string;
}

/**
 * A render step.
 *
 * This is a function that renders a template with a context.
 *
 * @template RenderContext The context type.
 * @param ctx The context.
 */
export interface RenderStep<RenderContext> extends Step<RenderContext> {
  /** The filename of the template. */
  filename: string;
}

/**
 * A render view.
 */
export interface RenderView {
  /** The metadata of the EPUB. */
  metadata: MetadataNode;
  /** The cover image of the EPUB. */
  cover: ImageNode | RefNode<NodeType.Image>;
  /** The images of the EPUB. */
  images: ImageNode[];
  /** The chapters of the EPUB. */
  chapters: ChapterNode[];
  /** The spine of the EPUB. */
  spine: SpineNode[];
  /** The fonts of the EPUB. */
  fonts: FontNode[];
  /** The CSS files of the EPUB. */
  css: CssNode[];
}

/**
 * Options for creating a renderer.
 * @template T The renderer options type.
 */
export interface CreateRendererOptions {
  /** The filename of the template. */
  filename?: string;
  /** A function that returns the partial template for a given name. */
  includer?: Includer;
}

/**
 * Create a renderer function from a template object.
 * @template View The view type.
 * @param template The template object.
 * @param options The options.
 */
export type CreateRenderer<View> = (
  template: TemplateObject,
  options?: CreateRendererOptions,
) => Renderer<View>;

/** The required templates for an EPUB. */
export type RequiredTemplates =
  | "META-INF/container.xml"
  | "OEBPS/content.opf"
  | "OEBPS/toc.ncx"
  | "OEBPS/nav.xhtml";

/** The templates for an EPUB. */
export type Templates =
  & Required<Record<RequiredTemplates, TemplateObject | undefined>>
  & Record<string, TemplateObject | undefined>;

/** The context for the render pipeline. */
export interface RenderContext {
  /** The view to render the template with. */
  readonly view: RenderView;
  /** The templates for the EPUB. */
  readonly templates: Templates;
  /** The structure of the EPUB. */
  readonly structure: Partial<EpubStructure>;
  /** The log of the render pipeline. */
  readonly log: Log;
}

/** A template object. Acts as a wrapper for a template string. */
export type TemplateObject = { template: string };

/**
 * An object that includes a template.
 */
export type IncludeResult = string;

/**
 * An includer for rendering templates.
 */
export type Includer = (path: string) => IncludeResult;

/**
 * Transform the filename of a chapter.
 *
 * **NOTE:** The filename must be the full path of the chapter, and end with the `.xhtml` extension.
 * This is however **not validated** upstream, so it is up to the caller to ensure this.
 *
 * @param chapter The chapter to transform.
 * @param index The index of the chapter. This is 1-based.
 * @default `OEBS/chapter-${index}.xhtml`
 */
export type TransformFilename<N extends Node> = (
  chapter: N,
  index: number,
) => string;

/**
 * Transform the view for rendering.
 * @template View The view type.
 * @param ctx The render context.
 */
export type TransformView<View, N extends Node = Node> = (
  ctx: RenderContext,
  node?: N,
) => View;

/**
 * A locked render context.
 *
 * This is a context that is locked for modification.
 * The view and templates are read-only.
 *
 * @template Context The render context type.
 */
export type Locked<Context extends RenderContext> =
  & DeepReadonly<
    Pick<Context, "view" | "templates">
  >
  & Omit<Context, "view" | "templates">;

/** Make the value deep readonly. */
export type DeepReadonly<T> = T extends (infer R)[] ? DeepReadonlyArray<R>
  : T extends object ? DeepReadonlyObject<T>
  : T;

/** Make an array deep readonly. */
export interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

/** Make an object deep readonly. */
export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};
