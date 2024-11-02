import type { RenderContext, TemplateObject, TransformView } from "./types";

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
 * @param ctx The render context.
 * @param transform The transform function for the view.
 */
export function getRenderView<View>(
  ctx: RenderContext,
  transform?: TransformView<View>,
): View {
  return transform ? transform(ctx) : (ctx.view as View);
}
