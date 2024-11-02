import type { Step } from "../pipeline";
import type {
  Includer,
  Locked,
  RenderContext,
  RenderStep,
  RenderView,
  Templates,
  TransformView,
} from "./types";
import { setAtPath } from "../helpers";
import { createRenderer } from "./renderers/mustache";
import { createLog, type Log } from "../log";
import { getRenderView } from "./helpers";

/**
 * Options for making a render step.
 */
export interface MakeRenderStepOptions<View> {
  /**
   * Transform the view for rendering.
   * @param ctx The render context.
   */
  transformView?: TransformView<View>;
}

/**
 * Make a renderer for a file using a template.
 * @param path The path of the file.
 * @param template The source template.
 * @param options The options for the renderer.
 * @returns A pipe function that renders the template and sets it in the context.
 */
export function makeRenderStep<View = RenderView>(
  path: string,
  options?: MakeRenderStepOptions<View>,
): RenderStep<Locked<RenderContext>> {
  const renderStep: Step<RenderContext> = async function renderTemplate(ctx) {
    const { templates, structure, log } = ctx;
    const template = templates[path];

    if (!template) {
      throw new IncludeError(path, `Template not found: ${path}`);
    }

    const render = createRenderer<View>(template, {
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
  (renderStep as any).filename = path;

  return renderStep as RenderStep<Locked<RenderContext>>;
}

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
