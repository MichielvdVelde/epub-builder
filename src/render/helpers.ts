import { createLog, type CreateLogOptions } from "../log";
import { Node } from "../types";
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
 * Get the render view from the context.
 * @template View The view type.
 * @template N The node type.
 * @param ctx The render context.
 * @param transform The transform function.
 */
export function getRenderView<View = RenderView, N extends Node = Node>(
  ctx: RenderContext,
  transform?: TransformView<View, N>,
): View;
/**
 * Get the render view from the context.
 * @template View The view type.
 * @template N The node type.
 * @param ctx The render context.
 * @param node The node to transform.
 * @param transform The transform function.
 */
export function getRenderView<View = RenderView, N extends Node = Node>(
  ctx: RenderContext,
  node: N,
  transform?: TransformView<View, N>,
): View;
export function getRenderView<View = RenderView, N extends Node = Node>(
  ctx: RenderContext,
  nodeOrTransform: N | TransformView<View, N>,
  transform?: TransformView<View, N>,
): View {
  const node = typeof nodeOrTransform === "function"
    ? undefined
    : nodeOrTransform;
  const transformFn = typeof nodeOrTransform === "function"
    ? nodeOrTransform
    : transform;
  return transformFn?.(ctx, node) ?? (ctx.view as View);
}
