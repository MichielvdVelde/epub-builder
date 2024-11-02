import type { CreateRendererOptions, Renderer, TemplateObject } from "../types";
import { compile, type Data, type Options } from "ejs";

type RendererOptions = Omit<Options, "async" | "client">;

/**
 * Creates a renderer function from a template object.
 * @template View The view type.
 * @param template The template object.
 * @param options The options.
 * @returns The renderer function.
 */
export function createRenderer<View>(
  template: TemplateObject,
  options?: CreateRendererOptions<RendererOptions>,
): Renderer<View> {
  const render = compile(template.template, {
    ...options,
    async: true,
    client: false,
  });

  const renderer: Renderer<View> = (view) => {
    return render(view as Data);
  };

  renderer.filename = options?.filename;
  return renderer;
}
