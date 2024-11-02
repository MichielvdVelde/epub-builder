import type { Step } from "../pipeline";
import type {
  CreateRenderer,
  Locked,
  RenderContext,
  RenderStep,
  RenderView,
  TransformView,
} from "./types";
import { setAtPath } from "../helpers";
import { getRenderView, makeIncluder, pathSep } from "./helpers";
import { IncludeError, RenderError } from "./errors";

/**
 * Options for making a render step.
 */
export interface MakeRenderStepOptions<View> {
  /** Create a renderer for the template. */
  createRenderer: CreateRenderer<View>;
  /**
   * Transform the view for rendering.
   * @param ctx The render context.
   */
  transformView?: TransformView<View>;
}

/**
 * Make a renderer for a file using a template.
 * @param path The path of the file.
 * @param options The options for the renderer.
 * @returns A step that renders the template.
 */
export function makeRenderFile<View = RenderView>(
  path: string,
  options: MakeRenderStepOptions<View>,
): RenderStep<Locked<RenderContext>> {
  const { createRenderer } = options;

  const renderStep: Step<RenderContext> = async function renderTemplate(ctx) {
    const { templates, structure, log } = ctx;
    const template = templates[path];

    if (!template) {
      throw new IncludeError(path, `Template not found: ${path}`);
    }

    const render = createRenderer(template, {
      filename: path,
      includer: makeIncluder(ctx),
    });

    // Get the render view from the context.
    const renderView = getRenderView(ctx, options?.transformView);

    let content: string | undefined;

    try {
      content = await render(renderView);
    } catch (error) {
      throw new RenderError(
        [error],
        renderStep as RenderStep<RenderContext>,
        `Failed to render template: ${path}`,
      );
    }

    // Set the rendered content in the structure.
    setAtPath(structure, path, content, pathSep);

    // Log the rendering of the template.
    log.info(`Rendered template: ${path}`);
  };

  // Set the filename of the template - useful for debugging.
  (renderStep as RenderStep<RenderContext>).filename = path;

  return renderStep as RenderStep<Locked<RenderContext>>;
}
