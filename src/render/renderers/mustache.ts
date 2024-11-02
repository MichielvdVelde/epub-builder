import type { CreateRendererOptions, Renderer, TemplateObject } from "../types";
import { render, type RenderOptions } from "mustache";

/**
 * Creates a renderer function from a template object.
 * @template View The view type.
 * @param template The template object.
 * @param options The options.
 * @returns The renderer function.
 */
export function createRenderer<View>(
  template: TemplateObject,
  options?: CreateRendererOptions & RenderOptions,
): Renderer<View> {
  const renderer: Renderer<View> = async (view) => {
    return render(template.template, view, options?.includer, options);
  };

  renderer.filename = options?.filename;
  return renderer;
}
