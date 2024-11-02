import type {
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
import type { Step } from "../pipeline";
import type { EpubStructure } from "../generate/types";
import type { DeepReadonly, TemplateObject } from "./types";
import { setAtPath } from "../helpers";
import { createRenderer } from "./renderers/mustache";
import { createLog, type Log } from "../log";

/** A template for rendering. */
// export type Template = string;

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
  view: RenderView;
  /** The templates for the EPUB. */
  templates: Templates;
  /** The structure of the EPUB. */
  structure: Partial<EpubStructure>;
  /** The log of the render pipeline. */
  log: Log;
}

/**
 * Make a renderer for a file.
 * @param path The path of the file.
 * @param template The source template.
 * @param options The options for the renderer.
 * @returns A pipe function that renders the template and sets it in the context.
 */
export default function makeRenderStep(
  path: string,
): RenderStep<Locked<RenderContext>> {
  const renderStep: Step<RenderContext> = async function renderTemplate(ctx) {
    const { view, templates, structure, log } = ctx;
    const template = templates[path];

    if (!template) {
      throw new IncludeError(path, `Template not found: ${path}`);
    }

    const render = createRenderer<RenderView>(template, {
      filename: path,
      includer: makeIncluder(ctx),
    });

    let content: string | undefined;

    try {
      content = await render(view);
    } catch (error) {
      throw new RenderError([error], renderStep as RenderStep<RenderContext>);
    }

    // Set the rendered content in the structure.
    setAtPath(structure, path, content, pathSep);

    // Log the rendering of the template.
    log.info(`Rendered template: ${path}`);
  };

  // Set the filename of the template - useful for debugging.
  (renderStep as any).filename = path;

  return renderStep as RenderStep<Locked<RenderContext>>;
}

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

/** The path separator for setting values in the structure. */
export const pathSep = { separator: "/" } as const;

/**
 * An object that includes a template.
 */
export type IncludeResult = string;

/**
 * An includer for rendering templates.
 */
export type Includer = (path: string) => IncludeResult;

/**
 * Make an includer for the given context.
 * @param ctx The context.
 */
export function makeIncluder(ctx: RenderContext): Includer {
  return (path) => {
    const template = ctx.templates[path];

    if (!template) {
      throw new IncludeError(path);
    }

    return template.template;
  };
}

/**
 * Create a render context.
 * @param view The view to render the template with.
 * @param templates The templates for the EPUB.
 */
export function createRenderContext(
  view: RenderView,
  templates: Templates,
): RenderContext {
  return {
    view,
    templates,
    structure: {},
    log: createLog(),
  };
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
 * An error that occurred during including a template.
 */
export class IncludeError extends Error {
  readonly name = "IncludeError";
  /** The path of the template that failed to include. */
  readonly path: string;

  constructor(path: string, message = `Failed to include template: ${path}`) {
    super(message);
    this.path = path;
  }
}

/**
 * An error that occurred during rendering.
 */
export class RenderError extends AggregateError {
  readonly name = "RenderError";
  /** The render function that failed. */
  readonly fn: RenderStep<RenderContext>;

  constructor(
    errors: unknown[],
    fn: RenderStep<RenderContext>,
    message = `Failed to render template: ${fn.filename}`,
  ) {
    super(errors, message);
    this.fn = fn;
  }
}
