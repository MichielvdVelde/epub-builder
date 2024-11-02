import { createLog, type CreateLogOptions } from "../log";
import { IncludeError } from "./errors";
import type {
  Includer,
  RenderContext,
  RenderView,
  TemplateObject,
  Templates,
  TransformView,
} from "./types";

/** The path separator for setting values in the structure. */
export const pathSep = { separator: "/" } as const;

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

/** Options for creating a render context. */
export interface CreateRenderContextOptions {
  /** Options for creating a log. */
  log?: CreateLogOptions;
}

/**
 * Create a render context.
 *
 * The render context is used to render templates with a view into a structure.
 * The context is passed to each render step, which can modify the structure.
 *
 * @param view The view to render the template with.
 * @param templates The templates for the EPUB.
 * @param options The options for the render context.
 */
export function createRenderContext(
  view: RenderView,
  templates: Templates,
  options?: CreateRenderContextOptions,
): RenderContext {
  return {
    view,
    templates,
    structure: {},
    log: createLog(options?.log),
  };
}

/**
 * Wraps a template with the template key.
 * @param template The template to wrap.
 */
export const wrapTemplate = (template: string): TemplateObject => ({
  template,
});

/**
 * Get the render view.
 *
 * - If a transform function is provided, it is called with the render context.
 * - Otherwise, the view is returned as is.
 *
 * @template View The type of the view.
 * @param ctx The render context.
 * @param transform The transform function for the view.
 */
export function getRenderView<View = RenderView>(
  ctx: RenderContext,
  transform?: TransformView<View>,
): View {
  return transform?.(ctx) ?? (ctx.view as View);
}
